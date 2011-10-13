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

  // aliases
  var ef = luban.elementFactory;
  var widgets = luban.widgets;
  var tag = luban.utils.tag;

  // documentmill handler
  var dmp = luban.documentmill.prototype;
  dmp.oncodeeditor = dmp._onElement;


  // code editor
  //  factory
  // implementation: depends on editArea
  ef.codeeditor = function(kwds, docmill, parent) {
    var textarea = tag('textarea', {'id': kwds.id});
    textarea.addClass('luban-codeeditor');

    var kls = kwds.Class;
    if (kls) {textarea.addClass(kls);}

    var text = kwds.text;
    if (text) {textarea.text(text);}
    
    var ret = textarea.lubanElement('codeeditor');
    if (parent) {parent.add(ret);}

    // editArea's init function need to be called to init the editor
    var opts = {
      'id': kwds.id,
      'syntax': kwds.syntax,
      'start_highlight': true,
      'allow_toggle': false
    };
    var toolbar = "search,go_to_line,|,fullscreen,|,undo,redo,|,select_font,|,reset_highlight,word_wrap,|,help";

    // onsave
    var onsave = kwds.onsave;
    if (onsave) {
      var f = function  (id, content) {
 	$('#'+id).data('save-data', {'content': content});
	docmill.compile(onsave);
      };
      var t = 'editarea_save_callback_' + kwds.id, c=t+'=f';
      eval(c);
      opts.save_callback = t;
      
      toolbar = 'save,|,'+toolbar;
    }

    // onchange
    var onchange = kwds.onchange;
    if (onchange) {
      var f2 = function (id) {
	var ta = $('#'+id);
	var text = ta.lubanElement().getAttribute('text');
	ta.data('change-data', {'content': text});
	docmill.compile(onchange);
      };
      var t2 = 'editarea_change_callback_' + kwds.id, c2=t2+'=f2';
      eval(c2);
      opts.change_callback = t2;
    }

    opts.toolbar = toolbar;

    editAreaLoader.init(opts);

    return ret;
  };
  //  object
  widgets.codeeditor = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  // self check
  widgets.codeeditor.selfcheck = function() {
    return editAreaLoader.iframe_css == null;
  };
  widgets.codeeditor.prototype = new widgets.base ();
  // should implement a method to destroy itself and remove
  // all event handler functions left as globals
  // ...
  // getAttribute
  widgets.codeeditor.prototype.getAttribute = function(name) {
    var je = this._je;
    if (name=='text') 
      { return editAreaLoader.getValue(je.attr('id')); }
  };
  // setAttribute
  widgets.codeeditor.prototype.setAttribute = function(attrs) {
    var je = this._je;
    
    var syntax = attrs.syntax;
    if (syntax) {
      alert("codeeditor is now implemented with 'editarea', and does not have the capability to change syntax dynamically");
    }
    var text = attrs.text;
    if (text) {
      editAreaLoader.setValue(je.attr('id'), text);
    }
  };

 })(luban, jQuery);

// End of file
