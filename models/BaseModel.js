class BaseModel {

  constructor(pojo) {
    Object.assign(this, pojo);
  }

  async update ( patch, options ) {
    // Mock DB update
    const result = await mockDbUpdate(
      { _id: this._id },
      patch
    );
    return result;
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
