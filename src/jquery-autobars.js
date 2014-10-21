/*
 * this file is a basic helper utility for people
 * using handlebars.js. it allowes you to store several
 * handlebars templates seperated with
 *
 *       <!--#?templateid-->
 *
 *
 *       <!--#?end-->
 *
 * Created by Peter de Croos (Cultofmetatron)
 * blog.peterdecroos.com
 */

(function($) {
	methods = {

		initialize: function() {

		},
		parseName:function(url) {
			var split_url = url.split("/");
			//get everything past the last slash
			var name = split_url[split_url.length-1];
			//strip querystring
			name = name.split("?")[0];
			split_name = name.split(".");
			if (split_name.length > 1) {
				//strip extension
				split_name = split_name.slice(0, -1);
			}
			return split_name.join(".");
		},
		parsePartials:function(data){
			/* this function splits the partials */

			//first we seperate the strings with a regular expression
			var seperatorToken = /<!--#\?[a-zA-Z]+-->/; //matches the headers
			var endToken = /<!--#\?end-->/;
			var END_TOKEN_SIZE = 12;
			//now we get the names of the partials
			var data = data.split('\n').join('');
			var templates = {};
			//first remove all white space charachters that are in groups > 2
			data = data.split(/\s{2,}/).join('');
			templates = {};
			//now that we have a whitespace stripped version, we loop throught them
			//all chunking them.
			//get the first token and extract the key
			while(data.match(seperatorToken)) {
				var token = data.match(seperatorToken)[0]; //gets the first token
				var name = token.match(/[a-zA-Z]+/)[0];//the name we get token
				data = data.slice(token.length);
				//feed in characters till you get to the end tag.
				var endIndex = data.search(endToken);
				var source = data.slice(0,endIndex);
				data = data.slice(endIndex + END_TOKEN_SIZE); //increment to the next size;
				templates[name] = Handlebars.compile(source);
			}
			// register partials for use within Handlebars templates
			// for usage, see https://github.com/wycats/handlebars.js/#partials
			for(key in templates) {
				methods.registerPartial(key, templates[key]);
			}
		},
		registerPartial: function(key, partial) {
			Handlebars.registerPartial(key, partial);
		},
		mainTemplates: function(context) {
			var pipe = [];//promise objects
			context.find('[type="text/x-handlebars-template"]').each(function(index, element) {
				var loadUrl = $(element).attr('src');
				//var name = loadUrl.match(/([^\/]+)(?=\.\w+$)/)[0];
				var name = methods.parseName(loadUrl);
				//here we gather all our promises
				pipe.push(
					$.ajax({
						url:loadUrl,
						dataType:"text"
					}).done(function(data) {
						jQuery.handlebarTemplates[name] = Handlebars.compile(data);
					})
				);
			});
			return pipe;
		},
		partials:  function(context) {
			//we take the nodes and pull out partials
			var pipe = [];//promise objects
			context.find('[type="text/x-handlebars-partial"]').each(function(index, element) {
				//handlebarTemplates = Handlebars.compile($(element).html());
				var loadUrl = $(element).attr('src');
				//gather the promises
				pipe.push(
					$.ajax({
						url:loadUrl,
						dataType:"text"
					}).done(function(data) {
						//each pageload is performed asynchronously and so the data exists only in this
						//context. here we scrub the input and use it;
						methods.parsePartials(data);
					})
				);
			});


			return pipe;
		},
	};
	jQuery.fn.autoBars = function(options, callback) {
		args = Array.prototype.slice.call(arguments, 0);
		if (args.length = 1 && typeof(args[0]) == 'function') {
			//checks if theres only one argument and sets the callback to be the first
			callback = options;
			options = {};
		}

		jQuery.handlebarTemplates = jQuery.handlebarTemplates || {}; //so we don't overwrite it
		jQuery.handlebarTemplates.partials = jQuery.handlebarTemplates.partials || {};
		var settings = $.extend({
			loadHandlebars : false,
		}, options);

		// gather all the promises from the multiple async calls
		var partialPromises   = methods.partials(this);
		var templatesPromises = methods.mainTemplates(this);
		var promises = partialPromises.concat(templatesPromises);

		// we delay exection of the callback until all the promises are fullfilled!!
		if (typeof(callback) === 'function') {
			$.when.apply(this, promises).done(callback);
		}


		return this // return the original jquery object
	}

	jQuery.fn.hbh = jQuery.fn.handlebarHelper
})(jQuery);


