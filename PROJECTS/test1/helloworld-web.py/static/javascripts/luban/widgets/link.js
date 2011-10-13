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
  dmp.onlink = dmp._onElement;

  
  // link
  //  factory
  ef.link = function(kwds, docmill, parent) {
    var id = kwds.id;
    var a = tag('a', {"id":id});
    a.text(kwds.label);
    a.addClass('luban-link');
    
    var kls = kwds.Class;
    if (kls) {a.addClass(kls);}

    var onclick = kwds.onclick;
    if (onclick != null && onclick != '') 
      { a.click( function() { docmill.compile(onclick); return false; } ); }
    var ret = a.lubanElement('link');
    if (parent) {parent.add(ret);}

    if (kwds.tip) {
      ret.setTip(kwds.tip);
    }
    return ret;
  };
  //  object
  widgets.link = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.link.prototype = new widgets.base ();
  widgets.link.prototype.setAttribute = function(attrs) {
    var je = this._je;

    var label = attrs.label;
    if (label != null) {je.text(label);}

    var tip = attrs.tip;
    if (tip !=null) {je.attr('title', tip);}
  };

 })(luban, jQuery);


// End of file
