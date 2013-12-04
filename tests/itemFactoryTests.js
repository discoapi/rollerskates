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
/*global discojs*/

(function(){
	
	/*
	 * shared variable for all tests
	 */
	var query = undefined;
	var itemsFactory = undefined;
	
	module("itemFactory Tests", {
		setup: function(){
			// code to run in start of each test
			query = new discojs.Query({
				'q': 'obama'
			});

			itemsFactory = new discojs.ItemsFactory('.itemtemplate');
		}
	});

	test("not a real test", function() {
		ok(true,"here");
	});
	
}());
