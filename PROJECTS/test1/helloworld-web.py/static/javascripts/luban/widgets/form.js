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
  dmp.onform = dmp._onContainer;

  // action renderer
  var lap = luban.actioncompiler.prototype;
  lap.onformclearerrors = function(action) {
    var form = this.dispatch(action.element);
    return form.clearErrors();
  };

  // form
  ef.form = function (kwds, docmill, parent) {
    var Class = kwds.Class;
    var id = kwds.id;
    var form = tag('form', {'id': id});

    var ret = form.lubanElement('form');
    if (parent) { parent.add(ret); }

    form.addClass(Class);
    form.addClass('luban-form');

    var fieldset = tag('fieldset'); form.append(fieldset);
    
    var title = kwds.title;
    var legend = tag('legend'); fieldset.append(legend);
    if (title) {
      legend.text(title);
    } else {
      legend.hide();
    }
    var onsubmit = kwds.onsubmit;
    if (onsubmit != null && onsubmit != '') {
      form.submit(function () { docmill.compile(onsubmit); return false; });
    } else {
      form.submit(function () {return false;});
    }
    
    var onclick = kwds.onclick;
    if (onclick) {
      form.click( function() { docmill.compile(onclick); return false; } );
    }
    return ret;
  };
  widgets.form = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.form.prototype = new widgets.base ();
  widgets.form.prototype.empty = function() {
    this.broadcastEvent('destroy');
    this._je.find('fieldset').empty();
  };
  widgets.form.prototype.add = function (subelem) {
    this._je.find('fieldset').append(subelem._je);
  };
  widgets.form.prototype.clearErrors = function (subelem) {
    // clear error boxes in the form
    this._je.find('.error').hide();
    this._je.find('.error-sign').hide();
  };
  widgets.form.prototype.setAttribute = function(attrs) {
    var form = this._je;
    var fieldset = form.children('fieldset');

    var title = attrs.title;
    var legend = fieldset.children('legend');
    if (title) {
      legend.text(title).show();
    } else {
      if (title=='') 
	{ legend.text(title).hide(); }
    }

    var Class = attrs.Class;
    if (Class) {
      form.removeClass();
      form.addClass(Class);
    }
  };


 })(luban, jQuery);


// End of file
