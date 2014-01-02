(function(){

	rollerskates = {};
	
	rollerskates.init = function(defaults){
		rollerskates._defaults = defaults;
	};

	/**
	*	rollerskates.Base
	*/	
	
	rollerskates.Base = function(){
		this._listeners = {};
		this._loadingstate = false;
	};
	
	rollerskates.Base.prototype = {
	
		addEventListener: function(event, context, callback){
			if(typeof(context)=='function'){
				callback = context;
			}
			this._listeners[event] = this._listeners[event] || [];
			this._listeners[event].push({context: context, callback: callback});
		},
		
		listenOnce: function(event, context, callback){
			if(typeof(context)=='function'){
				callback = context;
			}
			var me = this,
				uniquecontext = { event: event, context: context, callback: callback};
			function handler(){
				me.removeEventListener(event, context, callback);
				me.removeEventListener(event, uniquecontext, handler);
			}
			this.addEventListener(event, context, callback);
			this.addEventListener(event, uniquecontext, handler);
		},
		
		removeEventListener: function(event, context, callback){
			if(this._listeners[event]){
				for(var i=0; i<this._listeners[event].length; i++){
					var listener = this._listeners[event][i];
					if(listener.context==context && listener.callback==callback){
						listener.removed = true;
					}
				}
			}
		},
		
		fireEvent: function(event, data){
			if(this._listeners[event]){
				var length = this._listeners[event].length;
				for(var i=0; i<length; i++){
					var listener = this._listeners[event][i];
					if(!listener.removed){
						listener.callback.apply(listener.context || {}, data || []);
					}
				}
			}
		},
		
		isLoading: function(){
			return this._loadingstate;
		},
		
		_setLoadingState: function(loadingstate){
			if(this._loadingstate != loadingstate){
				this._loadingstate = loadingstate;
				this.fireEvent('loadingstatechange', [loadingstate]);
			}
		}
	};	

	function inherit(child, parent, proto){
		child.prototype = Object.create(parent.prototype);
		child.prototype.constructor = child;
		if(proto){
			for(var i in proto){
				child.prototype[i] = proto[i];
			}
		}
	}

	/**
	*	rollerskates.APICall
	*/
	
	rollerskates.APICall = function(apidata){
		rollerskates.Base.apply(this, arguments);
		this.apidata = apidata || {};
	};
	
	
	inherit( rollerskates.APICall, rollerskates.Base,
	{	
		
		start: function(){
			var search = this;
			this.cancel();
			this._setLoadingState(true);
			this._requestData = JSON.parse(JSON.stringify(this._getData()));
			this._everStarted = true;
			this.fireEvent('start');
			this._request = $.ajax({
				method: 'get',
				url: this._toUrl(),
				dataType: 'json',
				success: function(response){
					search._handleSuccess(response);
				},
				error: function(jqXHR, textStatus, errorThrown){
					if(textStatus!='abort'){
						search._handleError(jqXHR, textStatus, errorThrown);
					}
				}
			});
		},
		
		cancel: function(){
			if(this._request){
				this._request.abort();
				this._setLoadingState(false);
			}
		},
		
		getLastResponse: function(){
			return this._lastResponse;
		},
		
		_getData: function(){
			var data = this.apidata;
			if(rollerskates._defaults){
				for(var key in rollerskates._defaults){
					if(typeof(data[key])=='undefined'){
						data[key] = rollerskates._defaults[key];
					}
				}
			}
			return data;
		},
		
		_toUrl: function(){
			return this.url + '/' + JSON.stringify(this._getData());
		},
		
		_handleSuccess: function(response){
			this._setLoadingState(false);
			this._lastResponse = response;
			this._handleResponse(response);
		},
		
		_handleError: function(response){
			this._setLoadingState(false);
			this._lastResponse = undefined;
			this.fireEvent('error', arguments);
		},
		
		_handleResponse: function(response){}
	
	});

	/**
	*	rollerskates.Query
	*	events: [
			success,
			postsfound,
			nopostsfound,
			numberoftotalitemschange,
			numberofpageschange,
			lastpagechange
		]
	*/
	
	rollerskates.Query = function(apidata){
		rollerskates.APICall.apply(this, arguments);
		this.url = 'https://discoapi.com/api/query';
		this.addEventListener('start', this, this._checkPageLimits);
	};
	
	inherit( rollerskates.Query, rollerskates.APICall,
	{
		nextPage: function(){
			this.apidata.page = this.apidata.page || 1;
			if(this.isNextPagePossible()){
				this.apidata.page++;
				this.start();
			}
		},
		
		previousPage: function(){
			this.apidata.page = this.apidata.page || 1;
			if(this.apidata.page > 1){
				this.apidata.page--;
				this.start();
			}
		},
		
		goToPage: function(n){
			this.apidata.page = n;
			this.start();		
		},
		
		set: function(property, value){

			if (typeof property == 'object'){
				var properties = property;
				for (var property in properties){
					this.apidata[property] = properties[property];
				}
			} else{
				this.apidata[property] = value;
			}

			this.apidata.page = 1;
		},
		
		getNumberOfPages: function(){
			return this._totalPages;
		},
		
		isNextPagePossible: function(){
			var page = this.apidata.page || 1;
			return !(page >= this.getNumberOfPages());
		},
		
		_handleResponse: function(response){
			if(response.status==200){
				this._handleResponseTotalItems(response.total_items);
				if(response.items && response.items.length>0){
					this.fireEvent('success', [response]);
					this.fireEvent('postsfound', [response.items]);
				}else{
					this.fireEvent('success', [response]);
					this.fireEvent('nopostsfound', [response]);
				}
			}else{
				this.fireEvent('error', [response]);
			}
		},
		
		_handleResponseTotalItems: function(totalItems){
			var isDifferent = typeof(this._totalItems)=='undefined' || this._totalItems!=totalItems;
			this._totalItems = totalItems;
			if(isDifferent){
				this.fireEvent('numberoftotalitemschange', [totalItems]);
			}
			this._calculateNumberOfPages();
		}, 
		
		_calculateNumberOfPages: function(){
			var resultsPerPage = this.apidata.max_results || 10;
			var numberOfPages = Math.ceil(this._totalItems/resultsPerPage);
			this._handleNumberOfPages(numberOfPages);
			return numberOfPages;
		}, 
		
		_handleNumberOfPages: function(totalPages){
			var isDifferent = typeof(this._totalPages)=='undefined' || this._totalPages!=totalPages;
			this._totalPages = totalPages;
			if(isDifferent){
				this.fireEvent('numberofpageschange', [totalPages]);
				this._checkPageLimits();
			}
		},
		
		_checkPageLimits: function(){
			var page = this.apidata.page || 1,
				numberOfPages = this.getNumberOfPages(),
				apijsonstring = JSON.stringify(this.apidata),
				isRequestDifferent = this._apijsonstring!=apijsonstring,
				isLastPage = page==numberOfPages;			
			if(isRequestDifferent){
				delete(this._checkPageLimits_lastPageFired);
				delete(this._checkPageLimits_firstPageFired);			
			}			
			if(isLastPage && !this._checkPageLimits_lastPageFired){
				this._checkPageLimits_lastPageFired = true;	
				this.fireEvent('lastpagechange', [true]);
			}
			if(!isLastPage && this._checkPageLimits_lastPageFired){
				this._checkPageLimits_lastPageFired = false;
				this.fireEvent('lastpagechange', [false]);			
			}
			if(page==1){
				this.fireEvent('firstpage');
			}
		}
		
		
	});
	

	/**
	*	rollerskates.PostsFactory
	*	events: [
	*		postcreated,
	*		postscreated,
	*		loadingstatechange
	*	]
	*/
	
	rollerskates.PostsFactory = function(templatenode){
		rollerskates.Base.apply(this, arguments);
		this._components = [];
		this._itemMappers = [];
		this._Elements = {};
		this._idsFound = [];
		this._templates = [];
		for(var i=0; i<rollerskates.PostsFactory.defaultMappers.length; i++){
			this.addMapper(rollerskates.PostsFactory.defaultMappers[i]);
		}
		if(templatenode){
			this.setTemplate(templatenode);
		}
	};
	
	inherit( rollerskates.PostsFactory, rollerskates.Base,
	{
	
		connectQuery: function(query){
			if(query instanceof rollerskates.Query){
				this._components.push(query);
				query.addEventListener('postsfound', this, this._handleItemsFound);
				query.addEventListener('loadingstatechange', this, this._handleLoadingStateChange);
			}else{
				console_error('query must be of type rollerskates.Query. query = ', query);
			}
		},
	
		disconnectQuery: function(query){
			if(query instanceof rollerskates.Query){
				query.removeEventListener('postsfound', this, this._handleItemsFound);
				query.removeEventListener('loadingstatechange', this, this._handleLoadingStateChange);
				for(var i=0; i<this._components; i++){
					var component = this._components[i];
					if(component==query){
						this._components.splice(i,1); i--;
					}
				}
			}else{
				console_error('query must be of type rollerskates.Query. query = ', query);
			}
		},
		
		setTemplate: function(jquerynode, condition){
			if(!(jquerynode instanceof jQuery)){
				jquerynode = jQuery(jquerynode);
			}
			if(jquerynode.size()>0){
				this._templates.push({
					jquerynode: jquerynode,
					condition: condition
				});
			}else{
				console_error('could not find the template DOM element');
			}
		},
		
		addMapper: function(mapper){
			if(typeof(mapper)=='function'){
				this._itemMappers.push(mapper);
			}else{
				console_error('a mapper must be a function. mapper = ', mapper);
			}
		},
		
		createFromData: function(data){
			if(typeof(data.length)!='number'){
				data = [data];
			}
			var items = [];
			for(var i=0; i<data.length; i++){
				items[i] = jQuery.extend({}, data[i]);
			}
			if(this._preventDuplicates){
				for(var i=0; i<items.length; i++){
					for(var x=0; x<this._idsFound.length; x++){
						if(items[i].id==this._idsFound[x]){
							items.splice(i,1);
							i--;
							break;
						}
					}
				}
			}
			for(var i=0; i<items.length; i++){
				this._idsFound.push(items[i].id);
			}
			console.log('_preventDuplicates ?', this._preventDuplicates, items.length);
			var validator = this._getAvailableValidator();
			validator.setItems(items);
			validator.start();
		},
		
		preventDuplicates: function(){
			this._preventDuplicates = true;
		},
		
		cancel: function(){
			for(var i=0; i<this._components.length; i++){
				var component = this._components[i];
				if(typeof(component.cancel)=='function'){
					component.cancel();
				}
			}
		},
		
		_getAvailableValidator: function(){
			for(var i=0; i<this._components.length; i++){
				var component = this._components[i];
				if(component instanceof rollerskates.ItemsValidator && !component.isLoading()){
					return component;
				}
			}
			return this._createNewValidator();
		},
		
		_createNewValidator: function(){			
			var id = this._components.length,
				validator = new rollerskates.ItemsValidator();
			validator.addEventListener('loadingstatechange', this, this._handleLoadingStateChange);
			validator.addEventListener('itemvalid', this, function(item){
				this._handleItemValidation(id, item);
			});
			validator.addEventListener('complete', this, function(items){
				this._handleItemsValidation(id, items);
			});
			this._components.push(validator);
			return validator;
		},
		
		_handleItemsFound: function(items){
			this.createFromData(items);
		},
		
		_handleItemValidation: function(validator_id, item){
			var el = this._createElementFromTemplate(item);
			if(el){
				this._Elements[validator_id] = this._Elements[validator_id] || [];
				this._Elements[validator_id].push(el);
			}
		},
		
		_handleItemsValidation: function(validator_id){
			this.fireEvent('postscreated', [this._Elements[validator_id] || []]);
			this._Elements[validator_id] = [];
		},
		
		_createElementFromTemplate: function(item){
			if(item instanceof jQuery){
				item = item.data('discoapi_data');
			}
			if(this._itemMappers){
				for(var i=0; i<this._itemMappers.length; i++){
					if(this._itemMappers[i](item) === false){
						return false;
					}
				}
			}
			var template = this._getAppropriateTemplate(item);
			if(template){
				var html = template.html();
				for(var property in item){
					var string = '{'+property+'}';
					while(html.indexOf(string)>-1){
						html = html.replace(string, item[property]);
					}
				}
				var jqueryitem = jQuery('<div>').html(html).find(':first');
				jqueryitem.data('discoapi_data', item);
				this.fireEvent('postcreated', [jqueryitem]);
				return jqueryitem;
			}
		},
		
		_getAppropriateTemplate: function(item){
			var defaultTemplate;
			for(var i=0; i<this._templates.length; i++){
				var template = this._templates[i];
				if(!template.condition && !defaultTemplate){
					defaultTemplate = template;
				}
				if(typeof(template.condition)=='function' && template.condition(item)){
					return template.jquerynode;
				}
				if(template.condition && typeof(template.condition)=='object'){
					var condition_ok = true;
					for(var property in template.condition){
						if(item[property] != template.condition[property]){
							condition_ok = false;
						}
					}
					if(condition_ok){
						return template.jquerynode;
					}
				}
			}
			if(defaultTemplate){
				return defaultTemplate.jquerynode;
			}
		},
		
		_handleLoadingStateChange: function(){
			var state = false;
			for(var i=0; i<this._components.length; i++){
				var component = this._components[i];
				if(component.isLoading()){
					state = true;
					break;
				}
			}
			this._setLoadingState(state);
		}
		
	});
	
	
	rollerskates.PostsFactory.defaultMappers =
	[
		function(item){
			if(item.media_type=='video'){
				item.img_src = item.img_src.replace('http://', '//');
				item.img_src = item.img_src.replace('https://', '//');
			}
		},
	];

	/**
	*	rollerskates.ItemsValidator
	*/
	
	rollerskates.ItemsValidator = function(){
		rollerskates.Base.apply(this, arguments);
		this._validator = new rollerskates.ItemValidator();
		this._validator.addEventListener('complete', this, this._handleValidationComplete);
	};
	
	inherit( rollerskates.ItemsValidator, rollerskates.Base,
	{		
		setItems: function(items){
			if(typeof(items.length)!='number'){
				items = [items];
			}
			this._items = items;
			this._validItems = [];
		},
		
		start: function(){		
			this._setLoadingState(true);
			this._itemsCompleted = 0;
			for(var i=0; i<this._items.length; i++){
				this._validator.validate(this._items[i]);
			}
		},
		
		cancel: function(){
			this._validator.cancel();
			this._setLoadingState(false);
		},
		
		_handleValidationComplete: function(item, isValid){
			this._itemsCompleted++;
			if(isValid){
				this._validItems.push(item);
				this.fireEvent('itemvalid', [item]);
			}
			if(this._itemsCompleted==this._items.length){
				this.fireEvent('complete', [this._validItems]);
				this._setLoadingState(false);
			}
		}
		
	});

	/**
	*	rollerskates.ItemValidator
	*/
	
	rollerskates.ItemValidator = function(){
		rollerskates.Base.apply(this, arguments);
	};
	
	inherit( rollerskates.ItemValidator, rollerskates.Base,
	{		
		validate: function(item){
			this._canceled = false;
			if(item.media_type=='image'){
				var _self = this,
					image = new Image();
				image.src = item.img_src;
				if(image.width>0){
					_self._handleValid(item);
				}else{
					image.onload = function(){
						if(image.width>0){
							_self._handleValid(item);
						}else{
							_self._handleInvalid(item);						
						}				
					}
					image.onerror = function(){
						_self._handleInvalid(item);	
					}				
				}
			}else{
				this._handleValid(item);
			}
		},
		
		cancel: function(){
			this._canceled = true;		
		},
		
		_handleValid: function(item){
			if(!this._canceled){
				this.fireEvent('valid', [item]);
				this.fireEvent('complete', [item, true]);
			}
		},
		
		_handleInvalid: function(item){
			if(!this._canceled){
				this.fireEvent('invalid', [item]);
				this.fireEvent('complete', [item, false]);
			}
		}
	});
	
	function console_error(string){
		console.error('rollerskates: '+string);
	}
	
	/**
	*
	*/
	
	rollerskates.Stack = function(){
		rollerskates.Base.apply(this, arguments);
		this._items = [];
		this._isRunning = false;
		this._interval = 1000;
	};
	
	inherit( rollerskates.Stack, rollerskates.Base,
	{
		push: function(item){
			this._items.push(item);
			this._start();
		},
		
		_start: function(){
			if(!this._isRunning){
				this._isRunning = true;
				this._shift();
			}
		},
		
		_shift: function(){
			if(this._items.length>0){
				var item = this._items.shift();
				this.fireEvent('shift', [item]);
				var _self = this;
				setTimeout(function(){
					_self._shift();
				}, this._interval);
			}else{
				this._isRunning = false;					
			}
		},
		
	});
	
	/**
	*
	*/
	
	rollerskates.CSSFromTemplate = function(jquerynode){
		if(!(jquerynode instanceof jQuery)){
			jquerynode = jQuery(jquerynode);
		}
		var styles = [],
			providers = rollerskates.CSSFromTemplate.providers;
		for(var provider in providers){
			var css = jquerynode.html(),
				string = '{provider}';
			while(css.indexOf(string)>-1){
				css = css.replace(string, provider);
			}
			for(var property in providers[provider]){
				var string = '{'+property+'}';
				while(css.indexOf(string)>-1){
					css = css.replace(string, providers[provider][property]);
				}
			}
			styles.push(css);
		}
		$('<style>').html(styles.join('')).appendTo('body');		
	};
	
	$(document).ready(function(){
		$('.rollerskates-css-template').each(function(){
			rollerskates.CSSFromTemplate(this);
		});
	});
	
	rollerskates.CSSFromTemplate.providers =
	{
		twitter: {
			color: '#5b8ec9',
		},
		instagram: {
			color: '#8a5642',
		},
		youtube: {
			color: '#cf3227',
		},
		vimeo: {
			color: '#63b4e4',
		},
		flickr: {
			color: '#ed1983',
		},
		facebook: {
			color: '#3a589b',
		},
		tumblr: {
			color: '#3d5a70',
		},
		vine: {
			color: '#02a379',
		},
		picasa: {
			color: '#e24e5a',
		},
		photobucket: {
			color: '#000000',
		},
		metacafe: {
			color: '#f94700',
		},
		google: {
			color: '#45a445',
		},
		googleplus: {
			color: '#45a445',
		},
		dailymotion: {
			color: '#006792',
		}
	}
	

})();
