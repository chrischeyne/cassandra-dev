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
  dmp.onformtextarea = dmp._onElement;

  // actioncompiler handler
  var lap = luban.actioncompiler.prototype;
  lap.onformtextareashowerrormessage = function(action) {
    this.onformfieldshowerrormessage(action);
  };
  lap.onformtextareashowerror = function(action) {
    this.onformfieldshowerror(action);
  };

  // shortcuts
  var formfield = widgets.formfield;
  var formfield_setAttribute = widgets.formfield_setAttribute;
  var formfield_getAttribute = widgets.formfield_getAttribute;
  var prependActor = widgets.prependActor;
  

  // formtextarea
  ef.formtextarea = function(kwds, docmill, parent) {
    var div = formfield(kwds, docmill), input_container = div.find('.input-container');
    div.addClass('luban-formtextarea');

    var ret = div.lubanElement('formtextarea');

    var field = kwds;
    var args =  {
      'name': prependActor(field.name)
    };
    if (field.readonly) {
      args['readonly'] = 'readonly';
    }

    var input = tag('textarea', args);  input_container.append(input);
    input.text(field.value);
    
    if (kwds.tip) {ret.setTip(kwds.tip);}

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

    if (parent) {parent.add(ret);}
    return ret;
  };
  widgets.formtextarea = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.formtextarea.prototype = new widgets.base ();
  widgets.formtextarea.prototype.getInputWidget = function () {
    return this._je.find('textarea');
  };
  widgets.formtextarea.prototype.focus = function () {
    var je = this._je;
    var input = this.getInputWidget();
    input.focus();
  };
  widgets.formtextarea.prototype.setTip = function (tip) {
    var input = this.getInputWidget();
    input.attr('title', tip);
    input.tooltip({showURL: false});
  };
  widgets.formtextarea.prototype.setAttribute = function (attrs) {
    var je = this._je;
    formfield_setAttribute(je, attrs);
    
    var input = this.getInputWidget();

    var name = attrs.name;
    if (name) {
      input.attr('name', prependActor(name));
    }
    var readonly = attrs.readonly;
    if (readonly != null) {
      if (readonly) {
	input.attr('readonly', 'readonly');
      } else {
	input.removeAttr('readonly');
      }
    }

    var value = attrs.value;
    if (value != null) {
      input.text(value);
    }

    var tip = attrs.tip;
    if (tip != null) 
      { this.setTip(tip); }
  };
  widgets.formtextarea.prototype.getAttribute = function (name) {
    var je = this._je;
    var ret = formfield_getAttribute(je, name);
    if (ret) {return ret;}
    
    var input = this.getInputWidget();
    if (name=='readonly') 
      {return input.attr('readonly');}
    if (name=='value')
      {return input.val();}
  };


 })(luban, jQuery);


// End of file
