const { randomNumBetween } = require('../lib/utils');

class BaseModel {

  constructor(pojo) {
    Object.assign(this, pojo);
    this._beforeUpdateCallbacks = [];
    this._afterUpdateCallbacks = [];
  }

  async update ( patch, options ) {

    await this.runBeforeUpdateCallbacks(patch, options);

    // Mock DB update
    const result = await mockDbUpdate(
      { _id: this._id },
      patch
    );

    const x = await this.runAfterUpdateCallbacks(patch, options);
    return result;
  }

  registerAfterUpdateCallback({ callbackName, callback }) {
    // Require callbackName to help with debugging
    this._afterUpdateCallbacks.push({ callbackName, callback });
  }

  async runAfterUpdateCallbacks(patch, options) {
    const runCallbacks = this._runCallbacksPartial( this._afterUpdateCallbacks );
    await runCallbacks( patch, options );
  }
  
  registerBeforeUpdateCallback({ callbackName, callback }) {
    // Require callbackName to help with debugging
    this._beforeUpdateCallbacks.push({ callbackName, callback });
  }

  async runBeforeUpdateCallbacks(patch, options) {
    const runCallbacks = this._runCallbacksPartial( this._beforeUpdateCallbacks );
    await runCallbacks( patch, options );
  }

  _runCallbacksPartial( callbackArray ) {
    return async ( patch, options ) => {
      for ( const { callbackName, callback } of callbackArray ){
        try {
          await callback(patch, options);
        } catch ( err ) {
          // Append the callback name to help with debugging
          err.callbackName = callbackName;
          throw err;
        }
      }
    }
  }
}

// A simple func to emulate a db call
function mockDbUpdate (query, patch) {
  const randomInterval = randomNumBetween(200, 500);
  return new Promise(( resolve ) => {
    setTimeout(() => {
      return resolve( { ...patch } );
    }, randomInterval);
  });
}

module.exports = BaseModel;
