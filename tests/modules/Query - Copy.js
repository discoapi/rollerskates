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
	
	module("rollerskates.Query", {
		setup: function(){
			// code to run in start of each test
			query = new discojs.Query({
				'q': 'obama'
			});
		}
	});

	test("simple query creation", function() {
		equal(query.url, 'https://discoapi.com/api/query');
		equal(query.apidata.q, 'obama');
	});

	test("set()", function(){
		query.set('media_type','video');
		equal(query.apidata.media_type, 'video');
	});

	asyncTest("query success event", function() {
		expect(1);

		query.addEventListener('success',function(){
			ok(true,"got response");
			start();
		});

		query.start();		
	});

	asyncTest("query items found event", function(){
		query.addEventListener('itemsfound', function(){
			ok(true,"got response");
			start();
		});

		query.start();				
	});

	asyncTest("query itemsnotfound event", function(){
		query.set('q','fdfsafsfadsdfsafs'); // some unreasonalble query
		
		query.addEventListener('noitemsfound', {} ,function(){
			ok(true,"got response");
			start();
		});

		query.start();						
	});

	test("query numberofpageschange event", function(){

		expect(0);

		var newItemsNum = 20;

		query.addEventListener('numberofpageschange', function(number){
			ok(false,"unexpcted event fired");
		});
		 

		query.set('max_results',newItemsNum);
	});


	asyncTest("query isLoading()",function(){
		expect(2);
		
		var query = new discojs.Query({
			'q': 'obama'
		});

		query.start();
		
		ok(query.isLoading(),"isLoading() failed");

		// check it was reset in the end of query
		query.addEventListener('success',function(){
			ok(query.isLoading() == false,"isLoading() failed to reset status");
			start();
		});
		
	});

	asyncTest("query getNumberOfPages()",function(){

		// test if fails when not called yet
		//ok(false,"what should this return??");

		var itemsPerPage = 10;
		
		var query = new discojs.Query({
			'q': 'obama',
			'max_results': itemsPerPage
		});

		query.addEventListener("success",function(response){
			// manually calc last page
			var numOfPages = Math.ceil(response.total_items / itemsPerPage);
			ok(query.getNumberOfPages() == numOfPages,"wrong calc");
			start();
		});

		query.start();
	});
	

	asyncTest("query goToPage()",function(){
		// 1 async request
		stop();

		ok(query.goToPage(0) == false,"zero page");
		
		query.addEventListener('success',function(response){
			ok('true', 'got response');
			start();
		});

		query.goToPage(1);

	});


	
}());

