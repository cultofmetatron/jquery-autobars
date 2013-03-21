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

    load: function() {
        //console.log('this');

    },
    parsePartials:function(data){
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
        if (jQuery.fn.handlebarTemplates[key] === undefined) {
          //silently fails to load in a  new template if and older one exists;
          jQuery.fn.handlebarTemplates[key] = templates[key];
        }
      }
    },
  }
  jQuery.fn.handlebarHelper = function(method, options, callback) {
    jQuery.fn.handlebarTemplates = jQuery.fn.handlebarTemplates || {}; //so we don't overwrite it
    var settings = $.extend({
      loadHandlebars : false,
    }, options);
    //we take the nodes and pull out partials
    var partials =  this.find('[type="text/handlebar-partials"]').each(function(index, element) {
      //handlebarTemplates = Handlebars.compile($(element).html());
      var loadUrl = $(element).attr('src');
      $.get(loadUrl, function(data) {
        //each pageload is performed asynchronously and so the data exists only in this
        //context. here we scrub the input and use it;
        methods.parsePartials(data);
      })
    });
    //here we load full templates into the global space and name them according to their filename
    var templates;



    if (typeof(callback) === 'function') { callback(); }
    return this;
  }

  jQuery.fn.hbh = jQuery.fn.handlebarHelper
})(jQuery);




