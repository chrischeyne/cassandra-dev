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
  dmp.onhtmldocument = dmp._onElement;

  
  // htmldocument
  //  factory
  ef.htmldocument = function(kwds, docmill, parent) {
    var id = kwds.id;
    var div = tag('div', {"id":id});
    div.html(kwds.text.join('\n'));

    var kls = kwds.Class;
    if (kls) {div.addClass(kls);}

    var onclick = kwds.onclick;
    if (onclick) {
      div.click( function() { docmill.compile(onclick); return false; } );
    }
    var ret = div.lubanElement('htmldocument');
    if (parent) {parent.add(ret);}
    return ret;
  };
  //  object
  widgets.htmldocument = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.htmldocument.prototype = new widgets.base ();
  widgets.htmldocument.prototype.setAttribute = function(attrs) {
    var text = attrs.text;
    if (text!=null) {
      text = text.join('\n');
      this._je.html(text);
    }
  };


 })(luban, jQuery);


// End of file
