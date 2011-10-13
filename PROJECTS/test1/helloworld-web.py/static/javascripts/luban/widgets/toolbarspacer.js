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
  dmp.ontoolbarspacer = dmp._onElement;


  // toolbarspacer
  //  factory
  ef.toolbarspacer = function(kwds, docmill, parent) {
    var div = tag('div', {id: kwds.id});
    div.addClass('luban-toolbarspacer');
    var ret= div.lubanElement('toolbarspacer');
    if (parent) {parent.add(ret);}
    return ret;
  };
  //  object
  widgets.toolbarspacer = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.toolbarspacer.prototype = new widgets.base ();


 })(luban, jQuery);


// End of file
