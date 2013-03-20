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
      console.log(data);
      //first we seperate the strings with a regular expression
      var seperatorToken = /^\s?<!--#\?[a-zA-Z]+-->\s?/; //matches the headers
      var endToken = /^<!--#\?end-->\s?$/;
      //now we get the names of the partials
      var lines = data.split('\n');
      var templates = {};
      //go through each line looking for <!--#?templatename-->
      lines.forEach(function(line) {


      });


      debugger
    },

  }

  jQuery.fn.handlebarHelper = function(method, options) {
    jQuery.fn.handlebarTemplates = {};
    var settings = $.extend({
      loadHandlebars : false,
    }, options);
    //we take the nodes and pull out partials
    var partials =  this.find('[type="text/handlebar-partials"]').each(function(index, element) {
      //handlebarTemplates = Handlebars.compile($(element).html());
      var loadUrl = $(element).attr('src');
      console.log(loadUrl);
      $.get(loadUrl, function(data) {
        //each pageload is performed asynchronously and so the data exists only in this
        //context. here we scrub the input and use it;
        methods.parsePartials(data);

      })

    });

    return this;


  }

  jQuery.fn.hbh = jQuery.fn.handlebarHelper
})(jQuery);




