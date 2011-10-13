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
  dmp.ontoolbar = dmp._onContainer;


  // toolbar
  //  factory
  ef.toolbar = function(kwds, docmill, parent) {
    var div = tag('div', {id: kwds.id} ); div.addClass('luban-toolbar');
    var kls = kwds.Class; div.addClass(kls);
    var table = tag('table'); div.append(table);
    var tr = tag('tr'); table.append(tr);
    tr.addClass('luban-toolbar-interior-container');

    // add a cell just for possible decoration of toolbar
    var td = tag('td'); td.addClass('luban-toolbar-left-padding');
    tr.append(td);
    
    var ret = div.lubanElement('toolbar');
    if (parent) {parent.add(ret);}
    return ret;
  };
  //  object
  widgets.toolbar = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.toolbar.prototype = new widgets.base ();
  widgets.toolbar.prototype.add = function (subelem) {
    var td = tag('td');
    td.append(subelem.jqueryelem);
    
    var div = this.jqueryelem;
    var tr = div.find('.luban-toolbar-interior-container');
    tr.append(td);
  };


 })(luban, jQuery);


// End of file
