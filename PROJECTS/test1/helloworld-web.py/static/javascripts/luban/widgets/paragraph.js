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
  dmp.onparagraph = dmp._onContainer;

  
  // paragraph
  //  factory
  ef.paragraph = function(kwds, docmill, parent) {
    var id = kwds.id;
    var p = tag('p', {"id":id});
    p.text(kwds.text.join('\n'));

    var kls = kwds.Class;
    if (kls) {p.addClass(kls);}

    var onclick = kwds.onclick;
    if (onclick) {
      p.click( function() { docmill.compile(onclick); return false; } );
    }
    var ret = p.lubanElement('paragraph');
    if (parent) {parent.add(ret);}
    return ret;
  };
  //  object
  widgets.paragraph = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.paragraph.prototype = new widgets.base ();
  widgets.paragraph.prototype.setAttribute = function(attrs) {
    var text = attrs.text;
    if (text!=null) {
      if (typeof(text)!='string') 
	{ text = text.join('\n'); }
      this._je.text(text);
    }
  };
  widgets.paragraph.prototype.getAttribute = function(name) {
    if (name=='text') {return this._je.text();}
  };

 })(luban, jQuery);


// End of file
