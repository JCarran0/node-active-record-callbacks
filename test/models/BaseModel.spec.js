const BaseModel = require('./../../models/BaseModel');
const { randomNumBetween } = require('../../lib/utils');


describe('BaseModel', () => {

  describe('constructor', () => {
    
    test('initializes provided object correctly', () => {
      const pojo = {
        name: 'jared',
        favoriteColor: 'yellow'
      }
      const baseModel = new BaseModel(pojo);
      expect(baseModel.name).toEqual(pojo.name);
      expect(baseModel.favoriteColor).toEqual(pojo.favoriteColor);
    });
  });
});

