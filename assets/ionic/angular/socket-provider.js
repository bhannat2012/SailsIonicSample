/*
 Copyright (c) 2014 Tractus, INC
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */
(function (io) {
    "use strict";
    /**
     * A drop in replacement for $http that utilizes socket.io
     */
    angular.module('socketProvider', []).provider('socket', function SocketProvider() {
        // Create our socket
        var socket = io.connect();
        // Define our interceptors (functions that will be called on recieved messages)
        var interceptorFactories = this.interceptors = [];
        // Define the service here
        this.$get = [ "$q", "$rootScope", "$http", "$injector", function ($q, $rootScope, $http, $injector) {
            /**
             * Interceptors stored in reverse order. Inner interceptors before outer interceptors.
             * The reversal is needed so that we can build up the interception chain around the
             * server request.
             */
            var reversedInterceptors = [];
            angular.forEach(interceptorFactories, function (interceptorFactory) {
                reversedInterceptors.unshift(angular.isString(interceptorFactory) ? $injector.get(interceptorFactory) : $injector.invoke(interceptorFactory));
            });
            /**
             * Performs a request on the socket.
             *
             * @param requestConfig The config for the request
             *
             * @return A promise object.
             */
            function socketRequest(requestConfig) {
                var config = {};
                angular.extend(config, requestConfig);
                /**
                 * Makes the request.
                 *
                 * @param config The config with which to make the request
                 *
                 * @return A promise object.
                 */
                var makeRequest = function (config) {
                    var deferred = $q.defer();
                    var requestCallback = function (result) {
                        $rootScope.$apply(function () {
                            if (result.errors || (result.status && result.status !== 200)) {
                                return deferred.reject(result);
                            }
                            return deferred.resolve(result);
                        });
                    };
                    if (config.method === "get") {
                        socket.get(config.url, config.data, requestCallback);
                    } else if (config.method === "post") {
                        socket.post(config.url, config.data, requestCallback);
                    } else if (config.method === "put") {
                        socket.put(config.url, config.data, requestCallback);
                    } else if (config.method === "delete") {
                        socket.delete(config.url, config.data, requestCallback);
                    }
                    return deferred.promise;
                };
                var chain = [makeRequest, undefined];
                var promise = $q.when(config);
                // apply interceptors
                angular.forEach(reversedInterceptors, function (interceptor) {
                    if (interceptor.request || interceptor.requestError) {
                        chain.unshift(interceptor.request, interceptor.requestError);
                    }
                    if (interceptor.response || interceptor.responseError) {
                        chain.push(interceptor.response, interceptor.responseError);
                    }
                });
                while (chain.length) {
                    var thenFn = chain.shift();
                    var rejectFn = chain.shift();
                    promise = promise.then(thenFn, rejectFn);
                }
                promise.success = function (fn) {
                    promise.then(function (response) {
                        fn(response);
                    });
                    return promise;
                };
                promise.error = function (fn) {
                    promise.then(null, function (response) {
                        fn(response.errors, response.status);
                    });
                    return promise;
                };
                return promise;
            }

            return {
                socket:socket,
                /**
                 * Drop in replacement for the $http.get method
                 *
                 * @param url The URL to make the GET request to.
                 * @param config Optional configuration object
                 *
                 * @return A promise object with success and error callbacks
                 */
                get: function (url, config) {
                    if (!socket.socket.connected && !socket.socket.connecting) {
                        return $http.get(url, config);
                    }
                    var data = {};
                    if (!config) {
                        config = {};
                    }
                    config.url = url;
                    if (config.params) {
                        data = config.params;
                    }
                    config.data = data;
                    config.method = "get";
                    return socketRequest(config);
                },
                /**
                 * Drop in replacement for the $http.post method
                 *
                 * @param url The URL to make the POST request to.
                 * @param data The data to post
                 * @param config Optional configuration object
                 *
                 * @return A promise object with success and error callbacks
                 */
                post: function (url, data, config) {
                    if (!socket.socket.connected && !socket.socket.connecting) {
                        return $http.post(url, data, config);
                    }
                    if (!config) {
                        config = {};
                    }
                    config.url = url;
                    config.data = data;
                    config.method = "post";
                    return socketRequest(config);
                },
                /**
                 * Drop in replacement for the $http.put method
                 *
                 * @param url The URL to make the PUT request to.
                 * @param data The data to put
                 * @param config Optional configuration object
                 *
                 * @return A promise object with success and error callbacks
                 */
                put: function (url, data, config) {
                    if (!socket.socket.connected && !socket.socket.connecting) {
                        return $http.put(url, data, config);
                    }
                    if (!config) {
                        config = {};
                    }
                    config.url = url;
                    config.data = data;
                    config.method = "put";
                    return socketRequest(config);
                },
                /**
                 * Drop in replacement for the $http.delete method
                 *
                 * @param url The URL to make the DELETE request to.
                 * @param config Optional configuration object
                 *
                 * @return A promise object with success and error callbacks
                 */
                "delete": function (url, config) {
                    if (!socket.socket.connected && !socket.socket.connecting) {
                        return $http.delete(url, config);
                    }
                    var data = {}
                    if (!config) {
                        config = {};
                    }
                    if (config.params) {
                        data = config.params;
                    }
                    config.url = url;
                    config.data = data;
                    config.method = "delete";
                    return socketRequest(config);
                },
                /**
                 * Listens for messages on the socket and calls the callback provided with the message.
                 *
                 * @param model The model that the message listener is for.
                 * @param id The id of the object the message listener is for.
                 * @param updateCb The callback for when an update occurs.
                 * @param detletCb The message for when a delete occurs.
                 * @param createCb The message for when a create occurs.
                 *
                 * @return A deregister function to be called to remove the listener.
                 */
                on: function (model, id, updateCb, deleteCb, createCb) {
                    if (typeof id === 'function') {
                        createCb = deleteCb;
                        deleteCb = updateCb;
                        updateCb = id;
                        id = null;
                    }
                    var callback = function (message) {
                        if (id && message.id !== id) {
                            return;
                        }
                        if (message.verb === "updated" && updateCb) {
                            $rootScope.$apply(function () {
                                updateCb(message.data);
                            });
                        } else if (message.verb === "deleted" && deleteCb) {
                            $rootScope.$apply(function () {
                                deleteCb(message.data);
                            });
                        } else if (message.verb === "created" && createCb) {
                            $rootScope.$apply(function () {
                                createCb(message.data);
                            });
                        }
                    };
                    socket.on(model.toLowerCase(), callback);
                    return function () {
                        socket.removeListener(model.toLowerCase(), callback);
                    };
                },
                /**
                 * Removes all callbacks from the socket.
                 */
                off: function () {
                    socket.removeAllListeners();
                }
            };
        }
        ];
    });
})(
        // In case you're wrapping socket.io to prevent pollution of the global namespace,
        // you can replace `window.io` with your own `io` here:
        window.io
    );