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
  dmp.onformpasswordfield = dmp._onElement;

  // action handlers
  var lap = luban.actioncompiler.prototype;
  lap.onformpasswordfieldshowerrormessage = function(action) {
    this.onformfieldshowerrormessage(action);
  };
  lap.onformpasswordfieldshowerror = function(action) {
    this.onformfieldshowerror(action);
  };

  // shortcuts
  var formfield = widgets.formfield;
  var formfield_setAttribute = widgets.formfield_setAttribute;
  var formfield_getAttribute = widgets.formfield_getAttribute;
  var prependActor = widgets.prependActor;
  

  // formpasswordfield
  ef.formpasswordfield = function(kwds, docmill, parent) {
    var div = formfield(kwds, docmill), input_container = div.find('.input-container');
    div.addClass('luban-formpasswordfield');
    var field = kwds;
    var args =  {
      'name': prependActor(field.name),
      'type': 'password',
      'value': field.value
    };

    var input = tag('input', args); input_container.append(input);
    
    if (kwds.tip) {
      var tip = kwds.tip;
      input.attr('title', tip);
      input.tooltip({showURL: false});
    }

    var onchange = kwds.onchange;
    if (onchange) {
      input.change( function() { docmill.compile(onchange); return false; } );
    }

    var onfocus = kwds.onfocus;
    if (onfocus) {
      input.focus( function() { docmill.compile(onfocus); return false; } );
    }

    var onblur = kwds.onblur;
    if (onblur) {
      input.blur( function() { docmill.compile(onblur); return false; } );
    }

    var ret = div.lubanElement('formpasswordfield');
    if (parent) { parent.add(ret); }
    return ret;
  };
  widgets.formpasswordfield = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.formpasswordfield.prototype = new widgets.base ();
  widgets.formpasswordfield.prototype.getInputWidget = function () {
    return this._je.find('input');
  };
  widgets.formpasswordfield.prototype.focus = function () {
    var je = this._je;
    var input = this.getInputWidget();
    input.focus();
  };
  widgets.formpasswordfield.prototype.setAttribute = function (attrs) {
    var je = this._je;
    formfield_setAttribute(je, attrs);
    
    var value = attrs.value;
    if (value != null) {
      input = this.getInputWidget();
      input.val(value);
    }
  };
  widgets.formpasswordfield.prototype.getAttribute = function (name) {
    var je = this._je;
    var ret = formfield_getAttribute(je, name);
    if (ret) {return ret;}
    
    var input = this.getInputWidget();
    if (name=='value') {
      return input.val();
    }
  };


 })(luban, jQuery);


// End of file
