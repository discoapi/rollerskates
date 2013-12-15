/** JSLINT CONFIG */
/*jslint white: false, onevar: true, undef: true, nomen: false, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true */
/*global window: false, document: false, $: false, log: false, bleep: false,
// QUnit vars
QUnit: false,
test: false,
asyncTest: false,
expect: false,
module: false,
ok: false,
equal: false,
notEqual: false,
deepEqual: false,
notDeepEqual: false,
strictEqual: false,
notStrictEqual: false,
raises: false,
start: false,
stop: false
*/

/** Rollerskates JSLint */
/*global rollerskates*/

(function(){
	
	module("rollerskates.Base", {
		setup: function(){
			// code to run in start of each test
		}
	});

	test("addEventListener() & fireEvent()", function() {
		var base = new rollerskates.Base(),
			data = ['argument1', 'argument2'],
			context = { name: 'mycontext' };
		base.addEventListener('party', listenerA);
		function listenerA(){
			ok(true, "listener A should be called");
			equal(this, listenerA, "listener B context (this) should be itself");
			equal(arguments[0], data[0], "listener A first argument should be same as fired data");
			equal(arguments[1], data[1], "listener A second argument should be same as fired data");
		}
		base.addEventListener('party', context, function(){
			ok(true, "listener B should be called");
			equal(this, context, "listener B context (this) should be as decleared");
			equal(arguments[0], data[0], "listener B first argument should be same as fired data");
			equal(arguments[1], data[1], "listener B second argument should be same as fired data");
		});
		base.fireEvent('party', data);
		base.addEventListener('party', function(){
			ok(false, "listener C should not be called");
		});
	});

	asyncTest("addEventListener() & fireEvent() async", function() {
		var base = new rollerskates.Base(),
			data = ['argument1', 'argument2'],
			context = { name: 'mycontext' };
		base.addEventListener('party', context, function(){
			ok(true, "listener A should be called");
			equal(this, context, "listener A context (this) should be correct");
			equal(arguments[0], data[0], "listener A first argument should be same as fired data");
			equal(arguments[1], data[1], "listener A second argument should be same as fired data");
		});
		setTimeout(function(){
			base.fireEvent('party', data);
			base.addEventListener('party', function(){
				ok(false, "listener B should not be called");
			});
			start();
		}, 1000);
	});

	test("triggering one of two base object", function() {
		var base = new rollerskates.Base(),
			base2 = new rollerskates.Base();
		base.addEventListener('party', function(){
			ok(true, "listener for first base object should be called");
		});
		base2.addEventListener('party', function(){
			ok(false, "listener for first base object should not be called");
		});
		base.fireEvent('party');
	});

	test("listenOnce() vs. addEventListener()", function() {
		var base = new rollerskates.Base();
		base.addEventListener('party', function(){
			this.times = this.times || 0;
			this.times++;
			if(this.times==1){
				ok(true, 'listener added by addEventListener() is called 1st time');
			}
			if(this.times==2){
				ok(true, 'listener added by addEventListener() is called 2nd time');		
			}
		});
		base.listenOnce('party', function(){
			this.times = this.times || 0;
			this.times++;
			if(this.times==1){
				ok(true, 'listener added by listenOnce() is called 1st time');
			}
			if(this.times==2){
				ok(true, 'listener added by listenOnce() is called 2nd time');		
			}
		});
		base.fireEvent('party');
		base.fireEvent('party');
	});

	test("two listenOnce() listeners", function() {
		expect( 2 );
		var base = new rollerskates.Base();
		base.listenOnce('party', function(){
			ok(true, 'listener #1 was called');
		});
		base.listenOnce('party', function(){
			ok(true, 'listener #2 was called');
		});
		base.fireEvent('party');
	});

	test("Adding a listener inside a listener", function() {
		var base = new rollerskates.Base();
		base.listenOnce('party', function(){
			ok(true, 'parent listener was called');
			base.listenOnce('party', function(){
				ok(false, 'child listener should not be was called');
			});
		});
		base.fireEvent('party');
	});
	
}());

