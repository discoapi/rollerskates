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
	
	var all_events =
	[
		'loadingstatechange',
		'success',
		'postsfound',
		'nopostsfound',
		'numberoftotalitemschange',
		'numberofpageschange',
		'lastpagechange'		
	];
	
	module("rollerskates.Query", {
		setup: function(){
			// code to run in start of each test
		}
	});

	test("constructor", function() {
		var query = new rollerskates.Query({
			'q': 'obama'
		});
		equal(query.isLoading(), false, "isLoading() should return false");
		equal(query.getNumberOfPages(), undefined, "getNumberOfPages() should not be defined");
		equal(query.url, 'https://discoapi.com/api/query');
		equal(query.apidata.q, 'obama');
	});	
	
	asyncTest("start()", function(){
	
		var query = new rollerskates.Query();
		
		query.addEventListener('loadingstatechange', {} ,function(state){
			this.timesFired = this.timesFired || 0;
			if(this.timesFired==0){
				equal(state, true, "loadingstatechange becoming true");
				equal(state, query.isLoading(), "state equals isLoading()");
				start();
			}else if(this.timesFired==1){
				equal(state, false, "loadingstatechange becoming false");
				equal(state, query.isLoading(), "state equals isLoading()");
				start();
			}else{
				ok(false, "loadingstatechange should only be fired twice");				
			}
			this.timesFired++;
		});
		
		query.addEventListener('numberoftotalitemschange', {} ,function(n){
			equal(typeof(n), 'number', 'numberoftotalitemschange number');
			start();
		});
		
		query.addEventListener('numberofpageschange', {} ,function(n){
			equal(typeof(n), 'number', 'numberofpageschange number');
			start();
		});
		
		query.addEventListener('success', {} ,function(response){
			equal(typeof(response), 'object', 'success response');
			equal(query.isLoading(), false, "after success isLoading() should be false");
			start();
		});
		
		query.start();
		equal(query.isLoading(), true, "after start isLoading() should be true");
		stop(4);
		
	});
	
	
	asyncTest("cancel()", function(){
	
		var query = new rollerskates.Query();
		query.start();
		
		query.addEventListener('loadingstatechange', {} ,function(state){
			this.timesFired = this.timesFired || 0;
			if(this.timesFired==0){
				equal(state, false, "loadingstatechange becoming false");
				start();
			}else{
				ok(false, "loadingstatechange should only be fired once");				
			}
			this.timesFired++;
		});
		
		(function(){
			var fired = false;
			query.addEventListener('success', function(){
				fired = true;
			});
			setTimeout(function(){
				equal(fired, false, 'success event not being fired');
				start();
			}, 4000);
		})();
		
		query.cancel();
		stop(1);
		
	});
	
	asyncTest("set()", function(){	
		var query = new rollerskates.Query();
		query.start();		
		query.addEventListener('success', function(){
			setTimeout(function(){
				(function(){
					var number_of_events_fired = 0;
					for(var i=0; i<all_events.length; i++){
						var event = all_events[i];
						query.addEventListener(event, event, function(){
							console.log('event', this);
							number_of_events_fired++;							
						});
					}
					setTimeout(function(){
						equal(number_of_events_fired, 0, 'number of events fired being 0');
						start();
					}, 4000);
				})();				
				query.set('media_type','video');				
				query.set('max_results', 20);
				equal(query.apidata.media_type, 'video', 'apidata being changed (media_type)');
				equal(query.apidata.max_results, 20, 'apidata being changed (max_results)');
			}, 250);
		});
	});
	
	asyncTest("nextPage() when being in page 1", function(){	
		var query = new rollerskates.Query({ page: 1 });
		query.nextPage();
		equal(query.apidata.page, 2, 'page number should be changed');
		equal(query.isLoading(), true, 'isLoading() should start loading');
		query.addEventListener('success', function(response){
			equal(typeof(response), 'object', 'success response');
			start();
		});
	});
	
	asyncTest("previousPage() when being in page 4", function(){	
		var query = new rollerskates.Query({ page: 4 });
		query.previousPage();
		equal(query.apidata.page, 3, 'page number should be changed');
		equal(query.isLoading(), true, 'isLoading() should start loading');
		query.addEventListener('success', function(response){
			equal(typeof(response), 'object', 'success response');
			start();
		});
	});
	
	asyncTest("previousPage() when being in page 1", function(){	
		var query = new rollerskates.Query({ page: 1 });
		equal(query.apidata.page, 1, 'page number should not be changed');
		equal(query.isLoading(), false, 'isLoading() should not start loading');
		start();
	});
	
	asyncTest("goToPage(4)", function(){	
		var query = new rollerskates.Query();
		query.goToPage(4);
		equal(query.apidata.page, 4, 'page number should be changed');
		equal(query.isLoading(), true, 'isLoading() should start loading');
		query.addEventListener('success', function(response){
			equal(typeof(response), 'object', 'success response');
			equal(response.page, 4, 'response.page should be 4');
			start();
		});
	});
				
	asyncTest("getNumberOfPages()", function(){
		var query = new rollerskates.Query();
		query.start();
		equal(typeof(query.getNumberOfPages()), 'undefined', 'return value undefined before first success');
		query.addEventListener('success', function(){
			var n = query.getNumberOfPages();
			equal(typeof(n), 'number', 'return value being a number');
			ok(n > 0, 'return value > 0');
			query.set('max_results', 5);
			equal(query.getNumberOfPages(), n, 'return value should not changed after setting max_results = 5');
			start();
		});
	});
				
	asyncTest("isNextPagePossible() on page 4", function(){
		var query = new rollerskates.Query({page : 4 });
		query.start();
		query.addEventListener('success', function(){
			equal(query.isNextPagePossible(), true, 'return value should be true');
			start();
		});
	});
				
	asyncTest("isNextPagePossible() on last page", function(){
		var query = new rollerskates.Query();
		query.start();
		query.listenOnce('success', function(){
			query.goToPage(query.getNumberOfPages());
			query.cancel();
			equal(query.isNextPagePossible(), false, 'return value should be false');
			start();
		});
	});
				
	asyncTest("numberoftotalitemschange event", function(){
		var query = new rollerskates.Query(),
			number = null;
		query.start();
		query.listenOnce('numberoftotalitemschange', function(n){
			ok(true, 'event is fired');
			equal(typeof(n), 'number', 'value is a number');
			ok(n > 0, 'value > 0');
			number = n;
		});
		query.listenOnce('success', function(response){
			var event_fired = false;
			query.nextPage();
			query.listenOnce('numberoftotalitemschange', function(){
				event_fired = true;		
			});
			query.listenOnce('success', function(){
				setTimeout(function(){
					equal(event_fired, false, 'should not be fired after nextPage()');
					var event_fired_2nd_time = false;
					query.listenOnce('numberoftotalitemschange', function(n){
						event_fired_2nd_time = true;	
						ok(true, 'event is fired a while after altering the q property and starting');
						equal(typeof(n), 'number', 'value is a number');
						notEqual(n, number, 'value is different');
						start();
					});
					query.set('q', 'abracadabra');
					query.start();
					query.listenOnce('success', function(){
						setTimeout(function(){
							if(!event_fired_2nd_time){
								ok(false, 'event was not fired a while after altering the q property and starting');
								start();
							}
						}, 200);
					});
				}, 200);
			});
		});
	});
				
	asyncTest("numberofpageschange  event", function(){
		var query = new rollerskates.Query(),
			number = null;
		// (1) start normally
		query.start();
		query.listenOnce('numberofpageschange', function(n){
			ok(true, 'event is fired');
			equal(typeof(n), 'number', 'value is a number');
			equal(n, query.getNumberOfPages(), 'value equals getNumberOfPages()');
			number = n;
		});
		query.listenOnce('success', function(response){
			var event_fired = false;
			// (2) try nextPage
			query.nextPage();
			query.listenOnce('numberofpageschange', function(){
				event_fired = true;		
			});
			query.listenOnce('success', function(){
				setTimeout(function(){
					equal(event_fired, false, 'should not be fired after nextPage()');
					var event_fired_2nd_time = false;
					// (3) try altering max_results
					query.set('max_results', 5);
					query.start();
					query.listenOnce('numberofpageschange', function(n){
						event_fired_2nd_time = true;
						ok(true, 'event is fired a while after altering the max_results property and starting');
						equal(typeof(n), 'number', 'value is a number');
						equal(n, query.getNumberOfPages(), 'value equals getNumberOfPages()');
						notEqual(n, number, 'value is different');
						start();
					});
					query.listenOnce('success', function(){
						setTimeout(function(){
							if(!event_fired_2nd_time){
								ok(false, 'event was not fired a while after altering the max_results property and starting');
								start();
							}
						}, 200);
					});
				}, 200);
			});
		});
	});
	
	
}());