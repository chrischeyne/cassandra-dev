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
  dmp.ongrid = dmp.ongridrow = dmp.ongridcell = dmp._onContainer;


  // grid
  ef.grid = function (kwds, docmill, parent) {
    var Class = kwds.Class;
    var id = kwds.id;
    var ret = tag('div', {'id': id});

    ret.addClass(Class);
    ret.addClass('luban-grid');

    var onclick = kwds.onclick;
    if (onclick) {
      ret.click( function() { docmill.compile(onclick); return false; } );
    }
    ret = ret.lubanElement('grid');
    if (parent) {parent.add(ret);}
    
    ret.createSkeleton();
    return ret;
  };

  widgets.grid = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.grid.prototype = new widgets.base ();
  widgets.grid.prototype.createSkeleton = function() {
    var div = this._je;
    var table = tag('table'); div.append(table);
    var body = tag('tbody'); table.append(body);
    return body;
  };
  widgets.grid.prototype.getSkeleton = function() {
    var div = this._je;
    var table = div.children('table');
    var body = table.children('tbody');
    return body;
  };
  widgets.grid.prototype.add = function(child) {
    var skeleton = this.getSkeleton();
    skeleton.append(child.jqueryelem);
  };
  widgets.grid.prototype.empty = function() {
    this.broadcastEvent('destroy');
    var skeleton = this.getSkeleton();
    skeleton.emtpy();
  };
  widgets.grid.prototype.setAttribute = function(attrs) {
    var div = this._je;

    var Class = attrs.Class;
    if (Class) {
      div.removeClass();
      div.addClass(Class);
      div.addClass('luban-grid');
    }
  };

  // gridrow
  ef.gridrow = function (kwds, docmill, parent) {
    var Class = kwds.Class;
    var id = kwds.id;
    var ret = tag('tr', {'id': id});

    ret.addClass(Class);
    ret.addClass('luban-gridrow');

    var onclick = kwds.onclick;
    if (onclick) {
      ret.click( function() { docmill.compile(onclick); return false; } );
    }
    ret = ret.lubanElement('gridrow');
    if (parent) {parent.add(ret);}
    return ret;
  };
  widgets.gridrow = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.gridrow.prototype = new widgets.base ();


  // gridcell
  ef.gridcell = function (kwds, docmill, parent) {
    var Class = kwds.Class;
    var id = kwds.id;
    var ret = tag('td', {'id': id});

    ret.addClass(Class);
    ret.addClass('luban-gridcell');

    var onclick = kwds.onclick;
    if (onclick) {
      ret.click( function() { docmill.compile(onclick); return false; } );
    }
    ret = ret.lubanElement('gridcell');
    if (parent) { parent.add(ret); }
    return ret;
  };
  widgets.gridcell = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.gridcell.prototype = new widgets.base ();


 })(luban, jQuery);


// End of file
