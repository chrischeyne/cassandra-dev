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
  dmp.onframe = dmp._onContainer;

  
  // frame
  ef.frame = function (kwds) {
    var title = kwds.title;
    document.title = title;

    var ret = $('#body\-wrapper');
    if (ret.length===0) {
      ret = $('.luban-frame');
    }
    var id = kwds.id;
    if (id) {ret.attr('id', id);}
    ret.addClass('luban-frame');

    return ret.lubanElement('frame');
  };
  
  widgets.frame = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.frame.prototype = new widgets.base ();
  widgets.frame.prototype.setAttribute = function(attrs) {
      var title = attrs.title;
      if (title) {this.setTitle(title);}
  };
  widgets.frame.prototype.setTitle = function (title) {
    document.title = title;
  };
  // replace this frame with a new frame.
  // newframe: luban representation of newframe
  // docmill: document renderer
  widgets.frame.prototype.replaceBy = function (newframe, docmill) {
    this.empty();
    docmill.render(newframe);
  };

 })(luban, jQuery);


// End of file
