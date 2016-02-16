/*global Handlebars */
/*global jQuery */
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
  'use strict';
  var methods;

  methods = {
    initialize: function () {},
    parseName: function (url) {
      var splitName, splitUrl, name;

      splitUrl = url.split('/');
      //get everything past the last slash
      name = splitUrl[splitUrl.length - 1];
      //strip querystring
      name = name.split('?')[0];
      splitName = name.split('.');
      if (splitName.length > 1) {
        //strip extension
        splitName = splitName.slice(0, -1);
      }
      return splitName.join('.');
    },

    parsePartials: function (data) {
      var endToken, separatorToken, END_TOKEN_SIZE,
      templates;
      //first we seperate the strings with a regular expression
      separatorToken = /<!--#\?[a-zA-Z]+-->/; //matches the headers
      endToken = /<!--#\?end-->/;
      END_TOKEN_SIZE = 12;
      templates = {};
      // now we get the names of the partials
      //  first remove all white space characters that are in groups > 2
      data = data.split('\n').join('').split(/\s{2,}/).join('');
      // now that we have a whitespace stripped version,
      //  we loop through chunking them.
      // get the first token and extract the key
      while (data.match(separatorToken)) {
        var token = data.match(separatorToken)[0]; //gets the first token
        var name = token.match(/[a-zA-Z]+/)[0];//the name we get token
        data = data.slice(token.length);
        // feed in characters till you get to the end tag.
        var endIndex = data.search(endToken);
        var source = data.slice(0, endIndex);
        // increment to the next size;
        data = data.slice(endIndex + END_TOKEN_SIZE);
        templates[name] = Handlebars.compile(source);
      }
      // register partials for use within Handlebars templates
      // for usage, see https://github.com/wycats/handlebars.js/#partials
      for (var key in templates) {
        if (Object.prototype.hasOwnProperty.call(templates, key)) {
          methods.registerPartial(key, templates[key]);
        }
      }
    },

    registerPartial: function (key, partial) {
      // just invoke the partial function and get the
      Handlebars.registerPartial(key, partial);
      $.handlebarTemplates.partials[key] = partial;
    },

    mainTemplates: function (context, options) {
      var pipe = [];//promise objects

      // if the array with templates is provided we are going to use it instead of
      // reading the dom elements
      if (options.main_template_from_list.length > 0) {
        $.each(options.main_template_from_list, function(index, element){
          var loadUrl = element;
          //var name = loadUrl.match(/([^\/]+)(?=\.\w+$)/)[0];
          var name = methods.parseName(loadUrl);
          //here we gather all our promises
          pipe.push(
            $.ajax({
              url: loadUrl,
              dataType: 'text'
            }).done(function (data) {
              $.handlebarTemplates[name] = Handlebars.compile(data);
            })
          );
        });
      } else {
        context.find('[type="text/x-handlebars-template"]')
        .each(function (index, element) {
          var loadUrl = $(element).attr('src');
          //var name = loadUrl.match(/([^\/]+)(?=\.\w+$)/)[0];
          var name = methods.parseName(loadUrl);
          //here we gather all our promises
          pipe.push(
            $.ajax({
              url: loadUrl,
              dataType: 'text'
            }).done(function (data) {
              $.handlebarTemplates[name] = Handlebars.compile(data);
            })
          );
        });
      }
      return pipe;
    },

    partials: function (context, options) {
      //we take the nodes and pull out partials
      var pipe = [];//promise objects

      if (options.partial_template_from_list.length > 0) {
        $.each(options.partial_template_from_list, function(index, element){
          var loadUrl = element;
          //var name = loadUrl.match(/([^\/]+)(?=\.\w+$)/)[0];
          var name = methods.parseName(loadUrl);
          //here we gather all our promises
          pipe.push(
            $.ajax({
              url: loadUrl,
              dataType: 'text'
            }).done(function (data) {
              methods.parsePartials(data);
            })
          );
        });
      } else {
        context.find('[type="text/x-handlebars-partial"]')
        .each(function (index, element) {
          //handlebarTemplates = Handlebars.compile($(element).html());
          var loadUrl = $(element).attr('src');
          //gather the promises
          pipe.push(
            $.ajax({
              url: loadUrl,
              dataType: 'text'
            }).done(function (data) {
              //each pageload is performed asynchronously and so the data exists only in this
              //context. here we scrub the input and use it;
              methods.parsePartials(data);
            })
          );
        });
      }
      return pipe;
    }
  };

  $.fn.autoBars = function(params) {
    var options = $.extend({}, $.fn.autoBars.defaults, params);

    //so we don't overwrite it
    $.handlebarTemplates = $.handlebarTemplates || {};
    $.handlebarTemplates.partials = $.handlebarTemplates.partials || {};

    // gather all the promises from the multiple async calls
    var partialPromises   = methods.partials(this, options);
    var templatesPromises = methods.mainTemplates(this, options);
    var promises = partialPromises.concat(templatesPromises);

    // we delay execution of the callback until all
    //  the promises are fulfilled!!
    if (typeof(options.callback) === 'function') {
    	//Make the differed object accessible on page to chain multiple template-dependent methods
    	$.handlebarTemplates.deferred = $.when.apply(this, promises).done(options.callback);
    }
    // return the original jquery object
    return this;
  };

  $.fn.autoBars.defaults = {
    callback: $.noop,
    partial_template_from_list: [],
    main_template_from_list: []
  };
})(jQuery);


