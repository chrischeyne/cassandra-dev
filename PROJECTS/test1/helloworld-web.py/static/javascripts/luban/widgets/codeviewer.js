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
  dmp.oncodeviewer = dmp._onElement;


  // code viewer
  //  factory
  // implementation: depends on prettify
  ef.codeviewer = function(kwds, docmill, parent) {
    var element = tag('pre', {'id': kwds.id});
    element.addClass('luban-codeviewer');
    element.addClass('prettyprint');
    element.addClass('lang-' + kwds.syntax);

    var kls = kwds.Class;
    if (kls) { element.addClass(kls); }

    var text = kwds.text;
    if (text) { element.text(text); }
    
    var ret = element.lubanElement('codeviewer');
    if (parent) { parent.add(ret); }

    prettyPrint();

    return ret;
  };
  //  object
  widgets.codeviewer = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  // self check
  widgets.codeviewer.selfcheck = function() {
    try {
      var t = prettyPrint;
    } catch (e) {
      return true;
    }
    return false;
  };
  widgets.codeviewer.prototype = new widgets.base ();

 })(luban, jQuery);

// End of file
