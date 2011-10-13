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


  // documentmill handlers
  var dmp = luban.documentmill.prototype;
  dmp.onappmenubar = function(appmenubar) {
    var elem = this._onContainer(appmenubar);
    elem._je.jdMenu();
    return elem;
  };
  dmp.onappmenu = dmp._onContainer;
  dmp.onappmenuitem = dmp._onElement;



  // appmenubar
  //  factory
  ef.appmenubar = function(kwds, docmill, parent) {
    var ul = tag('ul', {id: kwds.id});
    var ret = ul.lubanElement('appmenubar');
    if (parent) {parent.add(ret);}
    return ret;
  };
  //  object
  widgets.appmenubar = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.appmenubar.selfcheck = function() {
      return $.fn.jdMenu == null || $.fn.offsetParent == null || $.fn.bgiframe == null || $.fn.positionBy == null;
  };
  widgets.appmenubar.prototype = new widgets.base ();

  // appmenu
  //  factory
  ef.appmenu = function(kwds, docmill, parent) {
    var li = tag('li', {id: kwds.id});
    var span = tag('span'); li.append(span);
    span.addClass('luban-appmenu');

    var icon = kwds.icon;
    if (icon != null && icon != '') {
      var img = tag('img', {src: luban.iconpath(icon)});
      span.append(img);
    }
    span.append(kwds.label);

    var ul = tag('ul', {id: kwds.id+'interior-container'});
    li.append(ul);
    
    var ret = li.lubanElement('appmenu');
    if (parent) { parent.add(ret); }
    return ret;
  };
  //  object
  widgets.appmenu = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.appmenu.prototype = new widgets.base ();
  widgets.appmenu.prototype.add = function(subelem) {
    var icid = this._je.attr('id')+'interior-container';
    var ul = $('#'+icid);
    ul.append(subelem._je);
  };


  // appmenuitem
  //  factory
  ef.appmenuitem = function(kwds, docmill, parent) {
    var li = tag('li', {id: kwds.id});
    var span = tag('span'); li.append(span);
    span.addClass('luban-appmenuitem');

    var icon = kwds.icon;
    if (icon != null && icon != '') {
      var img = tag('img', {src: luban.iconpath(icon)});
      span.append(img);
    }
    span.append(kwds.label);

    var onclick = kwds.onclick;
    if (onclick != null && onclick != '') {
      li.click(function() {docmill.compile(kwds.onclick); return false;});
    }
    var tip = kwds.tip;
    if (tip) {
      li.attr('title', tip);
      // li.tooltip({showURL: false}); // this does not work quite well
    }

    var ret= li.lubanElement('appmenuitem');
    if (parent) { parent.add(ret); }
    return ret;
  };
  //  object
  widgets.appmenuitem = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.appmenuitem.prototype = new widgets.base ();


 })(luban, jQuery);


// End of file
