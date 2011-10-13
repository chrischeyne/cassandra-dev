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
  dmp.onformtextfield = dmp._onElement;

  // action handlers
  var lap = luban.actioncompiler.prototype;
  lap.onformtextfieldshowerrormessage = function(action) {
    this.onformfieldshowerrormessage(action);
  };
  lap.onformtextfieldshowerror = function(action) {
    this.onformfieldshowerror(action);
  };
  // obsolete. for backward compatibility
  lap.onformtextfieldgetvalue = function(action) {
    var element = this.dispatch(action.element);
    return element._je.find('input').val();
  };

  // shortcuts
  var formfield = widgets.formfield;
  var formfield_setAttribute = widgets.formfield_setAttribute;
  var formfield_getAttribute = widgets.formfield_getAttribute;
  var prependActor = widgets.prependActor;
  

  // formtextfield
  ef.formtextfield = function(kwds, docmill, parent) {
    var div = formfield(kwds, docmill), input_container = div.find('.input-container');
    div.addClass('luban-formtextfield');

    var ret = div.lubanElement('formtextfield');
    if (parent) {parent.add(ret);}

    var field = kwds;
    var args =  {
      'name': prependActor(field.name),
      'type': 'text',
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

    return ret;
  };
  widgets.formtextfield = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.formtextfield.prototype = new widgets.base ();
  widgets.formtextfield.prototype.getInputWidget = function () {
    return this._je.find('input');
  };
  widgets.formtextfield.prototype.focus = function () {
    var je = this._je;
    var input = this.getInputWidget();
    input.focus();
  };
  widgets.formtextfield.prototype.setAttribute = function (attrs) {
    var je = this._je;
    formfield_setAttribute(je, attrs);
    
    var value = attrs.value;
    if (value != null) {
      var input = this.getInputWidget();
      input.val(value);
    }
  };
  widgets.formtextfield.prototype.getAttribute = function (name) {
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
