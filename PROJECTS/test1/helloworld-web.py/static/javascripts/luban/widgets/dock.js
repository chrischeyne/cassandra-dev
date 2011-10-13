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
  dmp.ondock = dmp._onElement;


  // actioncompiler handler
  var lap = luban.actioncompiler.prototype;
  lap.ondockaction = function(action) {
    var dock = this.dispatch(action.dock);
    var widget = this.dispatch(action.widget);
    var actionname = action.actionname;
    var callback = action.callback;
    
    code = 'dock.'+actionname+"(widget, callback)";
    return eval(code);
  };


  // dock
  //  factory
  ef.dock = function(kwds, docmill, parent) {
    var div = tag('div', {id: kwds.id} ); div.addClass('luban-dock');
    var kls = kwds.Class; div.addClass(kls);
    var table = tag('table'); div.append(table);
    var tr = tag('tr'); table.append(tr);
    tr.addClass('luban-dock-interior-container');

    // add a cell just for possible decoration of dock
    var td = tag('td'); td.addClass('luban-dock-left-padding');
    tr.append(td);
    
    var ret = div.lubanElement('dock');
    if (parent) { parent.add(ret); }
    return ret;
  };
  //  object
  widgets.dock = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.dock.prototype = new widgets.base ();
  widgets.dock.prototype.getInteriorContainer = function() {
    var div = this.jqueryelem;
    var tr = div.find('.luban-dock-interior-container');
    return tr;
  };
  widgets.dock.prototype._register = function(dockingposition, widget) {
    var je = this._je;
    var reg = je.data('registry');
    if (!reg) {
      reg = {};
      je.data('registry', reg);
    }
    reg[widget._je.attr('id')] = dockingposition;
  };
  widgets.dock.prototype._getDockingPosition = function(widget) {
    var je = this._je;
    var reg = je.data('registry');
    return reg[widget._je.attr('id')];
  };
  widgets.dock.prototype.attach = function (widget) {

      var dock = this;

    // now only works for widgets that are luban documents
      function makeIcon () {
    var title = widget.getTitleText();
    var td = tag('td');
    td.text(title);

    //
    var interior = dock.getInteriorContainer();
    interior.append(td);
    
    // 
    td.data('boat', widget);
    dock._register(td, widget);
    
    // when click, release the boat
    td.click(function () {
	dock.release($(this).data('boat'));
      });
      }

      var td = tag('td');
      td.text('ttt');
      var interior = this.getInteriorContainer();
      interior.append(td);
    // hide the widget
    var left = td.position().left;
      td.remove();
    var top = this._je.position().top;
    var jwidget = widget._je;
    jwidget.css('position', 'absolute');
    // save dims
    var dims = jwidget.position();
    dims.width = jwidget.width(); dims.height = jwidget.height();
    jwidget.data('saved-dims', dims);
    // animate 
    jwidget.animate({
	'left': left,
	  'top': top,
	  'width': '8em',
	  'height': '1em'
	  }, 
      'slow', 
	function(){jwidget.hide(makeIcon);}
      );
  };
  widgets.dock.prototype.release = function (widget, callback) {
    // show the widget
    var td = this._getDockingPosition(widget);
    var removefromdock = function () {
      td.remove();
    };
    
    var jwidget = widget._je;
    var dims = jwidget.data('saved-dims');
    
    var animate = function(callback) {
      var params = {'left': dims.left,
		    'top': dims.top,
		    'width': dims.width,
		    'height': dims.height
      };
      jwidget.animate(params, 'slow', callback);
    };
    
    var runcallback = function () {
      removefromdock();
      luban.docmill.compile(callback);
    };
    widget.show(function() {animate(runcallback);} );
  };


 })(luban, jQuery);


// End of file
