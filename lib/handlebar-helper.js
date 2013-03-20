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
    templates:{},
    load: function() {
        //console.log('this');

    }

  }


  jQuery.fn.handlebarHelper = function(options) {
    var settings = $.extend({
      loadHandlebars : false,
    }, options);

    return this.fadeOut();



  }

  jQuery.fn.hbh = jQuery.fn.handlebarHelper
})(jQuery);




