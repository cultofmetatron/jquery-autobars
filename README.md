jQuery Autobars
================

A convenient jquery plugin for loading handlebars templates declared in script tags!

Usage
================

jQuery-autobars's sweet spot is cases where you want to have your
handlebars templates in their own file/files.

This plugin makes the distinction between partials files (which
can hold multiple handlebars templates) and full templates which are one
per file.

Handlebar templates are loaded into `$.handlebarTemplates["compiled template"]`
by way of the the script tag type attribute.

```html
	<script src="/main.hbs" type="text/x-handlebars-template"></script>
```
Autobars looks at the src and downloads the code as needed, compiles it into
a handlebars template and adds the method to the $.handlebarTemplates namespace where you can use it in your projects!!


A partials file can contain one or several handlebar template source files. Just wrap the html like so
```html
	<!--#?index-->
	  handlebars code goes here
	<!--#?end-->
```
Handlebars helper knows its a a partials file via a script tag with type

```html
	<script src="/helper-templates.hbs" type="text/x-handlebars-partial"></script>
```
In this case the type="text/x-handlebars-partial" marks the file for additional parsing.

The name after the ? in the top indicates the name the partial will have. Partials are registered using
Handlebars and are accessed slightly [differently](https://github.com/wycats/handlebars.js/#partials).
Partials can be accessed from Handlebars templates using the following syntax

```html
	<div>
	<h1>Demonstration of partials</h1>
	
	<!-- Loading partial -->
	{{> index}}
	
	</div>

```

jQuery autobars can be used to replace existing $(document).ready() calls to guarantee that all your templates are loaded, or you can call it later as necessary. You can also load templates from document fragments as needed!
```javascript
	$(document).autoBars(function() {
		/* you pass a callback in to perform work on the templates
		becasuse handlebar helper is making multiple aynchrous requests
		and it makes sure to not call this callback till all the necessary files
		are loaded into the $.handlebarsTemplates namespace.
		*/
        console.log('it worked!!')
        var $html = $.handlebarTemplates.main({
            message: "hello welcome to handlebar helper!!",
        });
        $('body').append($html);
      });
```

Example of using a document fragment
```javascript
	var fragment = "
	<script src="/lazyLoaded.hbs" type="text/x-handlebars-template"></script>
	"
	$(fragment).autoBars(function() {
        var $html = $.handlebarTemplates.lazyLoaded({
            message: "I was loaded from a document fragment!",
        });
        $('body').append($html);
      });
```

Check the [example.html](example.html) for a complete running preview of what jQuery autobars can do

