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
  dmp.ondialog = dmp._onContainer;


  // actioncompiler handler
  var lap = luban.actioncompiler.prototype;
  lap.ondialogclose = function(action) {
    var element = this.dispatch(action.element);
    element.close();
  };
  lap.ondialogopen = function(action) {
    var element = this.dispatch(action.element);
    element.open();
  };


  // dialog
  ef.dialog = function (kwds, docmill, parent) {
    var Class = kwds.Class;
    var id = kwds.id;
    var ret = tag('div', {'id': id});
    ret.addClass('luban-dialog');
    ret.addClass(Class);
    
    var le = ret.lubanElement('dialog');
    if (parent) { parent.add(le); }
    var width = ret.width();

    var title = kwds.title;
    ret.attr('title', title);

    var onclick = kwds.onclick;
    if (onclick) {
      ret.click( function() { docmill.compile(onclick); return false; } );
    }
    // jquery dialog factory
    ret.dialog({
      bgiframe:true,
	  autoOpen: kwds.autoopen,
	  modal: true,
	  'width': width,
	  position: 'top',
	  close: function() {$(this).lubanElement().destroy();}
	//height: ???
      });
    return le;
  };

  widgets.dialog = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.dialog.prototype = new widgets.base ();
  widgets.dialog.prototype.setAttribute = function(attrs) {
    var div = this._je;

    var title = attrs.title;
    if (title!=null)
      { div.attr('title', title); }

    var Class = attrs.Class;
    if (Class) {
      div.removeClass();
      div.addClass(Class);
    }
  };
  widgets.dialog.prototype.open = function() {
    this._je.dialog('open');
  };
  widgets.dialog.prototype.close = function() {
    this._je.dialog('close');
  };
  widgets.dialog.prototype.destroy = function() {
    var je = this._je;
    je.dialog('destroy');
    je.remove();
  };

 })(luban, jQuery);


// End of file
