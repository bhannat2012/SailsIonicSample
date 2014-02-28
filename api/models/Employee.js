/**
 * Employee
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
  	
  	/* e.g.
  	nickname: 'string'
  	*/

    firstName:'string',
    lastName:'string'
    ,email:{
        type:'email'
        ,required:true
    }
  }

};
