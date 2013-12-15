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
	
	module("rollerskates.PostsFactory", {
		setup: function(){
			// code to run in start of each test
		}
	});
	
	$(document).ready(function(){
		
		var image_posts_data = [{"text":"Our Charlie Brown Christmas tree at the office @makersmark #nightcap #work #office #BoozeBiz #Christmas","title":"","author":"skidaleedoo","img_src":"http:\/\/distilleryimage8.s3.amazonaws.com\/070d537c627f11e3a8dd0a10f4513c60_8.jpg","height":640,"width":640,"media_type":"image","geo_latitude":"41.1711","geo_longitude":"-73.153338833","provider":"instagram","id":"5bfe184af1683cc91a3ffbca8b3e9f61823e697c","published":"2013-12-11T16:12:26+00:00"},{"text":"Seating area of the #homeoffice we just completed.  #furniture #birds #peacock #art #bold #design #office #follow #style #green #tan #grey #interiors #remodel #remake","title":"","author":"jadenrileyinteriors","img_src":"http:\/\/distilleryimage0.s3.amazonaws.com\/ca1a65fe627e11e3b14a125e3df59dac_8.jpg","height":640,"width":640,"media_type":"image","provider":"instagram","id":"162971961fa30b7e922ce9daeef4b9acc9ae8f90","published":"2013-12-11T16:10:44+00:00"},{"text":"#latergram from last week when Web really wanted some #christmas #cookie","title":"","author":"ifeellikeatourist","img_src":"http:\/\/distilleryimage10.s3.amazonaws.com\/b2a41ad2627e11e3b141125afd15e7e6_8.jpg","height":640,"width":640,"media_type":"image","geo_latitude":"40.873601664","geo_longitude":"-82.315698178","provider":"instagram","id":"d94f7f5af2b6c4600def44901d9659fad3b29ecb","published":"2013-12-11T16:10:05+00:00"}],
			text_posts_data = [{"media_type":"text","img_src":"","width":0,"height":0,"text":"Job in Canada: Assistant Front Office Manager  Kempi... http:\/\/t.co\/GZWQx42hq1","title":"","author":"JobsInCanadaCA","iso_language_code":"de","provider":"twitter","id":"600fa5a2fea6a600236dde9306457e757efbbff7","published":"2013-12-15T07:01:19+00:00"},{"media_type":"text","img_src":"","width":0,"height":0,"text":"@HunkSalmanKhan apne ko kya apne ko bas records cheer faadna hai box office pe Jai Ho","title":"","author":"being__jeet","iso_language_code":"tl","provider":"twitter","id":"4bbd8f2b06bd7d7cf995e709791ffdcc626557cb","published":"2013-12-15T07:01:17+00:00"},{"media_type":"text","img_src":"","width":0,"height":0,"text":"http:\/\/t.co\/FDeBjFqYWz Office 2010 toolkit 2.2.3 http:\/\/t.co\/NLn2KdRxy8","title":"","author":"kaitlynweckerle","iso_language_code":"en","provider":"twitter","id":"cc0ac9dec57bb07e320e47403b7769a26dd3c467","published":"2013-12-15T07:01:15+00:00"}];
		
		test("constructor", function() {
			var factory = new rollerskates.PostsFactory('.post_template');
			equal(factory.isLoading(), false, "isLoading() should return false");
		});

		asyncTest("setTemplate() via selector", function(){
			var is_fired = false,
				selector = '.post_template.text',
				factory = new rollerskates.PostsFactory();
			factory.setTemplate(selector);
			factory.addEventListener('postcreated', function(post){
				is_fired = true;
				ok(true, 'postcreated event should be fired');	
				ok((post instanceof jQuery), 'post should be an instance of jQuery');	
				equal(post.is('.post'), true, 'jQuery element has class "post"');
				start();
			});
			factory.createFromData(text_posts_data[0]);
			setTimeout(function(){
				if(!is_fired){
					ok(false, 'postcreated event should be fired');	
					start();
				}
			}, 200);
		});

		asyncTest("setTemplate() via jQuery element", function(){
			var is_fired = false,
				element = $('.post_template.text'),
				factory = new rollerskates.PostsFactory();
			factory.setTemplate(element);
			factory.addEventListener('postcreated', function(post){
				is_fired = true;
				ok(true, 'postcreated event should be fired');	
				ok((post instanceof jQuery), 'post should be an instance of jQuery');	
				equal(post.is('.post'), true, 'jQuery element has class "post"');
				start();
			});
			factory.createFromData(text_posts_data[0]);
			setTimeout(function(){
				if(!is_fired){
					ok(false, 'postcreated event should be fired');	
					start();
				}
			}, 200);
		});

		asyncTest("multiple posts", function(){
			var postcreated_times_fired = 0,
				postscreated_times_fired = 0,
				factory = new rollerskates.PostsFactory('.post_template.text');
			factory.addEventListener('postcreated', function(post){
				postcreated_times_fired++;
				ok((post instanceof jQuery), 'post should be an instance of jQuery');	
			});
			factory.addEventListener('postscreated', function(posts){
				postscreated_times_fired++;
				equal(posts.length, 3, 'postscreated returning correct number of posts');
				for(var i=0; i<posts.length; i++){
					if(!(posts[i] instanceof jQuery)){
						ok(false, 'postcreated returned a non-jQuery post');
					}
				}
			});
			factory.createFromData(text_posts_data);
			setTimeout(function(){
				equal(postcreated_times_fired, 3, 'postcreated event should be fired 3 times');	
				equal(postscreated_times_fired, 1, 'postscreated event should be fired once');	
				start();
			}, 200);
		});

		asyncTest("setTemplate() with condition object", function(){
			var postcreated_times_fired = 0,
				factory = new rollerskates.PostsFactory();
			factory.setTemplate('.post_template.text', { author: 'JobsInCanadaCA' });
			factory.addEventListener('postcreated', function(post){
				postcreated_times_fired++;
				ok((post instanceof jQuery), 'post should be an instance of jQuery');	
			});
			factory.createFromData(text_posts_data);
			setTimeout(function(){
				equal(postcreated_times_fired, 1, 'postcreated event should be fired only once');	
				start();
			}, 200);
		});

		asyncTest("setTemplate() with condition function", function(){
			var postcreated_times_fired = 0,
				factory = new rollerskates.PostsFactory();
			factory.setTemplate('.post_template.text', function(post){
				return post.author=='JobsInCanadaCA';
			});
			factory.addEventListener('postcreated', function(post){
				postcreated_times_fired++;
				ok((post instanceof jQuery), 'post should be an instance of jQuery');	
			});
			factory.createFromData(text_posts_data);
			setTimeout(function(){
				equal(postcreated_times_fired, 1, 'postcreated event should be fired only once');	
				start();
			}, 200);
		});

		asyncTest("addMapper() with condition function", function(){
			var postcreated_times_fired = 0,
				factory = new rollerskates.PostsFactory('#template_addMapper');
			factory.addMapper(function(post){
				equal(typeof(post), 'object', 'addMapper(post) correct argument');
				equal(typeof(post.author), 'string', 'addMapper(post) correct argument "author" property');
				post.myProperty = 'myValue';
				post.author = '#'+post.author;
			});
			factory.addEventListener('postcreated', function(post){
				postcreated_times_fired++;
				equal(post.find('.myProperty').text(), 'myValue', "post.find('.myProperty') having correct value");	
				ok(post.find('.author').text().indexOf('#')==0, "post.find('.author') starting with a #");	
				ok(post.find('.author').text().indexOf(text_posts_data[0].author)==1, "post.find('.author') containing the author name");	
			});
			factory.createFromData(text_posts_data[0]);
			setTimeout(function(){
				equal(postcreated_times_fired, 1, 'postcreated event should be fired once');	
				ok(true);
				start();
			}, 200);
		});
		
		asyncTest("discoapi_data", function(){
			$(document).ready(function(){
				var post_data = text_posts_data[0],
					postcreated_times_fired = 0,
					factory = new rollerskates.PostsFactory('.post_template.text');
				factory.addEventListener('postcreated', function(post){
					postcreated_times_fired++;
					equal(typeof(post.data('discoapi_data')), 'object', "post.data('discoapi_data') is an object");
					equal(post.data('discoapi_data').author, post_data.author, "post.data('discoapi_data').author is correct");
				});
				factory.createFromData(post_data);
				setTimeout(function(){
					equal(postcreated_times_fired, 1, 'postcreated event should be fired only once');	
					start();
				}, 200);
			});
		});
		
		asyncTest("preventDuplicates()", function(){
			$(document).ready(function(){
				var post_data = text_posts_data[0],
					postcreated_times_fired = 0,
					factory = new rollerskates.PostsFactory('.post_template.text');
				factory.addEventListener('postcreated', function(post){
					postcreated_times_fired++;
				});
				factory.createFromData(post_data);
				factory.createFromData(post_data);
				factory.preventDuplicates();
				factory.createFromData(post_data);
				factory.createFromData(post_data);
				setTimeout(function(){
					equal(postcreated_times_fired, 2, 'postcreated event should be fired only twice');	
					start();
				}, 200);
			});
		});
		
		asyncTest("loadingstatechange event on text posts", function(){
			$(document).ready(function(){
				var times_fired = 0,
					factory = new rollerskates.PostsFactory('.post_template.text');
				factory.addEventListener('loadingstatechange', function(isLoading){
					times_fired++;
					equal(isLoading, factory.isLoading(), 'return value is same as isLoading()'); 
				});
				factory.createFromData(text_posts_data);
				setTimeout(function(){
					equal(times_fired, 2, 'loadingstatechange event should be fired twice');	
					start();
				}, 2000);
			});
		});
		
		asyncTest("loadingstatechange event on image posts", function(){
			$(document).ready(function(){
				var times_fired = 0,
					factory = new rollerskates.PostsFactory('.post_template.text');
				factory.addEventListener('loadingstatechange', function(isLoading){
					times_fired++;
					equal(isLoading, factory.isLoading(), 'return value is same as isLoading()'); 
				});
				factory.createFromData(image_posts_data);
				setTimeout(function(){
					equal(times_fired, 2, 'loadingstatechange event should be fired twice');	
					start();
				}, 5000);
			});
		});
		
		asyncTest("cancel() on image posts", function(){
			$(document).ready(function(){
				var times_fired = 0,
					factory = new rollerskates.PostsFactory('.post_template.text');
				factory.addEventListener('postfound', function(post){
					times_fired++;
				});
				factory.addEventListener('postsfound', function(post){
					times_fired++;
				});
				factory.createFromData(image_posts_data);
				factory.cancel();
				setTimeout(function(){
					equal(times_fired, 0, 'postfound event should be fired 0 times');	
					start();
				}, 1000);
			});
		});
		
		asyncTest("connectQuery()", function(){
			$(document).ready(function(){
				var times_fired = 0,
					query = new rollerskates.Query({ media_type: 'text' }),
					factory = new rollerskates.PostsFactory('.post_template.text');
				factory.connectQuery(query);
				factory.addEventListener('postcreated', function(post){
					times_fired++;
				});
				query.addEventListener('success', function(){
					setTimeout(function(){
						equal(times_fired, 10, 'number of posts created should be 10');	
						start();
					}, 500);
				});
				query.start();
			});
		});
		
		asyncTest("disconnectQuery()", function(){
			$(document).ready(function(){
				var times_fired = 0,
					query = new rollerskates.Query({ media_type: 'text' }),
					factory = new rollerskates.PostsFactory('.post_template.text');
				factory.connectQuery(query);
				factory.addEventListener('postcreated', function(post){
					times_fired++;
				});
				query.addEventListener('success', function(){
					setTimeout(function(){
						equal(times_fired, 0, 'number of posts created should be 0');	
						start();
					}, 500);
				});
				query.start();
				factory.disconnectQuery(query);
			});
		});
		
	});
	
	//asyncTest("start()", function(){
	
}());
