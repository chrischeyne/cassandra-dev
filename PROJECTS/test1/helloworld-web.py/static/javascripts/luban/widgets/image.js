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
  dmp.onimage = dmp._onElement;

  
  // image
  //  factory
  ef.image = function(kwds, docmill, parent) {
    var id = kwds.id;
    var div = tag('div', {"id": id}); div.addClass('luban-image-container');

    var tip = kwds.tip;
    if (tip) {
      div.attr('title', tip);
      div.tooltip({showURL: false});
    }

    var path = kwds.path; var img;
    img = tag('img', {'src': luban.imagepath(path)});
    div.append(img);
    img.addClass('luban-image');

    var kls = kwds.Class;
    if (kls) {div.addClass(kls);}

    var caption = kwds.caption; 
    if (caption) {
      var captiondiv = tag('div');
      div.append(captiondiv);
      captiondiv.text(caption);
    }

    var onclick = kwds.onclick;
    if (onclick != null && onclick != '') {
      div.click( function() { docmill.compile(onclick); return false; } );
    }
    var ret = div.lubanElement('image');
    if (parent) {parent.add(ret);}
    return ret;
  };
  //  object
  widgets.image = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.image.prototype = new widgets.base ();
  widgets.image.prototype.setAttribute = function(attrs) {
    var div = this._je;
    var img = div.children('img');

    var path = attrs.path;
    if (path)
      { img.attr('src', luban.imagepath(path)); }
  };

 })(luban, jQuery);


// End of file
