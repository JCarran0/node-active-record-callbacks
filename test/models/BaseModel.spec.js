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

  describe('active record callbacks', () => {

    test('callbacks can be registered', () => {
      class MockChildClass extends BaseModel {
        constructor(pojo){
          super(pojo);

          this.registerAfterUpdateCallback({ 
            callbackName: 'doSomethingAfterCallback', 
            callback: this.doSomethingAfterCallback
          });

          this.registerBeforeUpdateCallback({ 
            callbackName: 'doSomethingAfterCallback', 
            callback: this.doSomethingAfterCallback
          });          
        }
  
        doSomethingAfterCallback (patch, options) {
          return { patch, options };
        }
      }      
      const child = new MockChildClass();

      expect(child._afterUpdateCallbacks.length).toBe(1);
      expect(child._afterUpdateCallbacks[0].callbackName).toBe('doSomethingAfterCallback');

      expect(child._beforeUpdateCallbacks.length).toBe(1);
      expect(child._beforeUpdateCallbacks[0].callbackName).toBe('doSomethingAfterCallback');      
    })

    test('after update callback is called with expected args', async () => {
      // Create a mock to use as an afterUpdate callback
      const afterUpdateCallbackSpy = jest.fn();

      class MockChildClass extends BaseModel {
        constructor(pojo){
          super(pojo);
          this.registerAfterUpdateCallback({ 
            callbackName: 'doSomethingAfterCallback', 
            callback: this.doSomethingAfterCallback
          });
        }
  
        doSomethingAfterCallback () {
          return afterUpdateCallbackSpy.apply(this, arguments);
        }
      }      
      const child = new MockChildClass();

      const testPatch = { name: 'johanna' };
      const testOptions = { updatingUser: 'jared' };
      
      await child.update(testPatch, testOptions);

      expect(afterUpdateCallbackSpy.mock.calls.length).toBe(1);
      expect(afterUpdateCallbackSpy.mock.calls[0][0]).toBe(testPatch);
      expect(afterUpdateCallbackSpy.mock.calls[0][1]).toBe(testOptions);
    }) 

    test('multiple after update callbacks are called with expected args', async () => {
      // Create a mock to use as an afterUpdate callback
      const afterUpdateCallbackSpy = jest.fn();

      class MockChildClass extends BaseModel {
        constructor(pojo){
          super(pojo);
          this.registerAfterUpdateCallback({ 
            callbackName: 'doSomethingAfterCallback', 
            callback: this.doSomethingAfterCallback
          });

          this.registerAfterUpdateCallback({ 
            callbackName: 'doSomethingElseAfterCallback', 
            callback: this.doSomethingElseAfterCallback
          });
          
          this.registerAfterUpdateCallback({ 
            callbackName: 'doOneOtherThing', 
            callback: this.doOneOtherThingAfterCallback
          });          
        }
  
        doSomethingAfterCallback () {
          return afterUpdateCallbackSpy.apply(this, arguments);
        }

        doSomethingElseAfterCallback () {
          return afterUpdateCallbackSpy.apply(this, arguments);
        }
        
        doOneOtherThingAfterCallback () {
          return afterUpdateCallbackSpy.apply(this, arguments);
        }        
      }      
      const child = new MockChildClass();

      const testPatch = { name: 'johanna' };
      const testOptions = { updatingUser: 'jared' };
      
      await child.update(testPatch, testOptions);

      expect(afterUpdateCallbackSpy.mock.calls.length).toBe(3);

      const calls = afterUpdateCallbackSpy.mock.calls;

      calls.forEach((call) => {
        expect(call[0]).toBe( testPatch );
        expect(call[1]).toBe( testOptions );
      });
    }) 
    
    test('multiple after update callbacks are called in series', async () => {
      const resolveOrder = [];
      function getTestPromise (i, time) {
        return new Promise(( resolve ) => {
          setTimeout(() => {
            resolveOrder.push(i);
            debugger;
            resolve(i);
          }, time);
        });
      }

      class MockChildClass extends BaseModel {
        constructor(pojo){
          super(pojo);
          this.registerAfterUpdateCallback({ 
            callbackName: 'doSomethingAfterCallback', 
            callback: this.doSomethingAfterCallback
          });

          this.registerAfterUpdateCallback({ 
            callbackName: 'doSomethingElseAfterCallback', 
            callback: this.doSomethingElseAfterCallback
          });
          
          this.registerAfterUpdateCallback({ 
            callbackName: 'doOneOtherThingAfterCallback', 
            callback: this.doOneOtherThingAfterCallback
          });          
        }
        
        // Making the first promise take longest to resolve will prove that
        // a successful test is because calls are in series
        async doSomethingAfterCallback () {
          await getTestPromise(1, 400);
        }

        async doSomethingElseAfterCallback() {
          await getTestPromise(2, 200);
        }

        async doOneOtherThingAfterCallback() {
          await getTestPromise(3, 100);
        }
      }

      const child = new MockChildClass({ name: 'jared' });

      await child.update();

      expect(resolveOrder).toEqual([1, 2, 3]);
    })
    
    test('before update callback is called with expected args', async () => {
      // Create a mock to use as an afterUpdate callback
      const beforeUpdateCb = jest.fn();

      class MockChildClass extends BaseModel {
        constructor(pojo){
          super(pojo);
          this.registerBeforeUpdateCallback({ 
            callbackName: 'doSomethingBeforeCallback', 
            callback: this.doSomethingBeforeCallback
          });
        }
  
        doSomethingBeforeCallback (options) {
          return beforeUpdateCb.apply(this, arguments);
        }
      }      
      const child = new MockChildClass();

      const testPatch = { name: 'johanna' };
      const testOptions = { updatingUser: 'jared' };
      
      await child.update(testPatch, testOptions);

      expect(beforeUpdateCb.mock.calls.length).toBe(1);
      expect(beforeUpdateCb.mock.calls[0][0]).toBe(testPatch);
      expect(beforeUpdateCb.mock.calls[0][1]).toBe(testOptions);
    })     
  });
});

