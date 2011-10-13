// -*- JavaScript -*-
//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
//                                   Jiao Lin
//                      California Institute of Technology
//                       (C) 2008-2009 All Rights Reserved  
//
// {LicenseText}
//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//


// requires:
//    * luban-core.js


(function(luban, $) {
  
  luban.documentmill = function (actioncompiler, preloader) {
    if (preloader == null) {
      preloader = new luban.compiler_preloader();
    }
    this.preloader = preloader;

    if (actioncompiler == null) {
      actioncompiler = new luban.actioncompiler(this);
    }
    this.actioncompiler = actioncompiler;
    actioncompiler.preloader = preloader;

    preloader.actioncompiler = actioncompiler;
  };
  
  luban.documentmill.prototype = {

    'compile': function(action) {
      return this.actioncompiler.compile(action);
    },

    'render': function (doc, parent) {
      //
      if (doc.lubanaction) {this.compile(doc);}
      //
      var toload = this.preloader.findThingsToLoad(doc);
      if (toload) {
	var self=this;
	this.preloader.load(toload, function() {self.render(doc, parent);});
      } else {
	if (parent) {this._parent = parent;}
	return this.dispatch(doc);
      }
    },
    
    'dispatch': function (doc) {
      var parent = this._parent;
      if (typeof(doc) == 'string') {
	parent._je.append(doc);
	return doc;
      }
      var type = doc.type;
      var handler = 'on'+type;

      code = 'this.'+handler+"(doc)";
      var ret = eval(code);

      // know my parent
      if (parent) {ret.setParent(parent);}

      // set my name
      var name = doc.name;
      if (name)
	{ret.jqueryelem.attr('luban-element-name', name);}
      
      // hide if necessary
      if (doc.hidden) {ret.hide();}

      // onkeypress handler
      if (doc.onkeypress) {
	var docmill = this;
	ret.jqueryelem.keypress(function(event) {
	    var $this = $(this);
	    $this.data('keypress-data', {'keycode': event.which});
	    docmill.compile(doc.onkeypress); return false; 
	  });
      }

      // oncreate handler
      if (doc.oncreate) {
	var self = this;
	var oncreatecallback = function () {
	  self.compile(doc.oncreate);
	};
	ret.jqueryelem.bind('luban-create', oncreatecallback);
	ret.jqueryelem.trigger('luban-create');
	//this.compile(doc.oncreate);
      }
      // shadow?
      // this has to be here because jquery.shadow can not 
      // draw shadow correctly without everything already in place
      var kls = doc.Class;
      if (kls) {
	var classes = kls.split(' ');
	if (jQuery.inArray('has-shadow', classes)!=-1) {
	  var target = ret.jqueryelem;
	  target.dropShadow({opacity:0.6});
	  /*
	    the following does not work well since there will be a big sequnce of changes
	    usually when element.replaceContent happens.
	    ret.jqueryelem.watch('width', function() {
	    $(this).trigger("resize");
	    }, 200, "_width");
	    ret.jqueryelem.watch('height', function() {
	    $(this).trigger("resize");
	    }, 200, "_height");
	  */
	  var f = function() {target.redrawShadow();};
	  $(window).resize(f);
	  target.resize(f);
	}
      }

      return ret;
    },

    '_onContainer': function(container) {
      var parent = this._parent;
      var type = container.type;
      var factory = luban.elementFactory[type];
      var elem = factory(container, this, parent);

      var contents = container.contents;
      if (contents != null) {
	
	for (var i in contents) {
	  this._parent = elem;
	  var subdoc = contents[i];
	  if (typeof(subdoc) == 'string') {
	    elem._je.append(subdoc);
	  } else {
	    subelem = this.dispatch(subdoc);
	  }
	}

      }
      return elem;
    },
    
    '_onElement': function(element) {
      var type = element.type;
      var factory = luban.elementFactory[type];
      var elem = factory(element, this, this._parent);
      return elem;
    },
    
    'oncredential': function(credential) {
      return this._onElement(credential);
    },


    'createEvtHandler': function(action) {
      var self = this;
      function h() {
	self.compile(action); return false;
      }
      return h;
    }

  };


  if (jQuery.browser.msie) {
    alert('This site works best with firefox, safari, and google chrome. You may want to use one of them instead of Microsoft internet explorer.');
  }
  if (jQuery.browser.opera) {
    luban.documentmill.prototype.render = function () {
      var body = $('body');
      var div = $('div');
      div.html('Your browser is not yet supported. Please use <a href="http://www.mozilla.com/firefox/">firefox</a>, <a href="http://www.apple.com/safari/">safari</a> , <a href="http://www.google.com/chrome">google chrome</a>, or <a href="http://flock.com">flock</a>');
      body.append(div);
    };
  }


  luban.docmill = new luban.documentmill();


 })(luban, jQuery);


// End of file
