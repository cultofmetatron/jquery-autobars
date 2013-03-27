/* this file is a basic helper utility for people
 * using handlebars.js. it allowes you to store several
 * handlebars templates seperated with
 *
 *       <!--#?templateid-->
 *
 *
 *       <!--#?end-->
 */

(function($) {
  methods = {

    initialize: function() {
        //console.log('this');

    },
    parsePartials:function(data){
      /* this function splits the partials */
        
      //first we seperate the strings with a regular expression
      var seperatorToken = /<!--#\?[a-zA-Z]+-->/; //matches the headers
      var endToken = /<!--#\?end-->/;
      var END_TOKEN_SIZE = 12;
      //now we get the names of the partials
      var data = data.split('\n').join('');;
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
      //load the, into the handlebarTemplates namespace;
      for(key in templates) {
        if (jQuery.handlebarTemplates[key] === undefined) {
          //silently fails to load in a  new template if and older one exists;
          jQuery.handlebarTemplates.partials[key] = templates[key];
        }
      }
    },
    mainTemplates: function(context) {
      var pipe = [];//promise objects
      context.find('[type="text/x-handlebars-template"]').each(function(index, element) {
        var loadUrl = $(element).attr('src');
        var name = loadUrl.match(/[a-zA-Z]+/);
        //here we gather all our promises
        pipe.push($.get(loadUrl, function(data) {
          jQuery.handlebarTemplates[name] = Handlebars.compile(data);
        }));
      });
      console.log('main templates', pipe);
      return pipe;
    },
    partials:  function(context) {
      //we take the nodes and pull out partials
      var pipe = [];//promise objects
      context.find('[type="text/handlebar-partials"]').each(function(index, element) {
        //handlebarTemplates = Handlebars.compile($(element).html());
        var loadUrl = $(element).attr('src');
        //gather the promises
         pipe.push($.get(loadUrl, function(data) {
          //each pageload is performed asynchronously and so the data exists only in this
          //context. here we scrub the input and use it;
          methods.parsePartials(data);
        }));
      });

      console.log('partials', pipe)

      return pipe;
    },
  };
  //heres where it begins
  jQuery.fn.handlebarHelper = function(options, callback) {
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
    console.log(promises);
    
    // we delay exection of the callback until all the promises are fullfilled!!
    if (typeof(callback) === 'function') {
        $.when.apply(this, promises).done(callback);
    }


    return this // return the original jquery object
  }

  jQuery.fn.hbh = jQuery.fn.handlebarHelper
})(jQuery);




