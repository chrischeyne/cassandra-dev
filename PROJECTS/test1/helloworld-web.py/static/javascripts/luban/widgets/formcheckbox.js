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
  dmp.onformcheckbox = dmp._onElement;

  // 
  var formfield = widgets.formfield;
  var formfield_setAttribute = widgets.formfield_setAttribute;
  var formfield_getAttribute = widgets.formfield_getAttribute;
  var prependActor = widgets.prependActor;
  

  // formcheckbox
  ef.formcheckbox = function(kwds, docmill, parent) {
    var field = kwds;
    var div = tag('div', {'id': kwds.id});
    div.addClass('luban-formcheckbox');
    
    var label = tag('p'); label.addClass('label'); 
    div.append(label);
    if (kwds.label) {
      label.text(kwds.label);
    }

    var args =  {
      'name': prependActor(field.name),
      'type': 'checkbox'
      //,'value': field.value
    };

    if (kwds.checked || kwds.value) {args['checked'] = 'checked';}
    var input = tag('input', args);
    div.append(input);

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

    var ret= div.lubanElement('formcheckbox');
    if (parent) {parent.add(ret);}
    return ret;
  };
  widgets.formcheckbox = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.formcheckbox.prototype = new widgets.base ();
  widgets.formcheckbox.prototype.getInputWidget = function () {
    return this._je.find('input:checkbox');
  };
  widgets.formcheckbox.prototype.focus = function () {
    var je = this._je;
    var input = this.getInputWidget();
    input.focus();
  };
  widgets.formcheckbox.prototype.setAttribute = function (attrs) {
    var je = this._je;
    var input = this.getInputWidget();
    if (input.length===0) {throw "checkbox not found";}

    var name = attrs.name;
    if (name) {
      input.attr('name', prependActor(name));
    }
    var checked = attrs.checked;
    if (checked!=null) {
      if (checked) {input.attr('checked', 'checked');}
      else {input.removeAttr('checked');}
    }
    var value = attrs.value;
    if (value!=null) {
      if (typeof(value) == 'string')
	{ value = luban.utils.str2bool(value); }
      if (value) { input.attr('checked', 'checked'); }
      else { input.removeAttr('checked'); }
    }
    var label = attrs.label;
    if (label != null) {
      var labelp = je.children('.label');
      labelp.text(label);
    }
  };
  widgets.formcheckbox.prototype.getAttribute = function (name) {
    var je = this._je;
    var ret = formfield_getAttribute(name);
    if (ret) { return ret; }

    if (name=='checked' || name=='value') {
      var input = this.getInputWidget();
      return Boolean(input.attr('checked'));
    }

    if (name=='label') {
      var labelp = je.children('.label');
      return labelp.text();
    }
  };


 })(luban, jQuery);


// End of file
