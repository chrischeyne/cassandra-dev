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
  dmp.onformsubmitbutton = dmp._onElement;

  // 
  var formfield = widgets.formfield;
  var formfield_setAttribute = widgets.formfield_setAttribute;
  var formfield_getAttribute = widgets.formfield_getAttribute;
  var prependActor = widgets.prependActor;
  

  // formsubmitbutton
  ef.formsubmitbutton = function(kwds, docmill, parent) {
    var div = tag('div', {'id': kwds.id});
    div.addClass('luban-submitbutton-container');

    var kls = kwds.Class;
    if (kls) {div.addClass(kls);}

    var field = kwds;
    var args =  {
      'name': prependActor(kwds.name),
      'type': 'submit',
      'value': field.label
    };

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
    
    var ret = div.lubanElement('formsubmitbutton');
    if (parent) {parent.add(ret);}
    return ret;
  };
  widgets.formsubmitbutton = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.formsubmitbutton.prototype = new widgets.base ();
  widgets.formsubmitbutton.prototype.setAttribute = function (attrs) {
    var je = this._je;

    var input = je.children('input');

    var name = attrs.name;
    if (name) {
      input.attr('name', prependActor(name));
    }
    var label = attrs.label;
    if (label) {
      input.attr('value', label);
    }
  };
  widgets.formsubmitbutton.prototype.getAttribute = function (name) {
    var je = this._je;
    var ret = formfield_getAttribute(je, name);
    if (ret) {return ret;}
    
    var input = je.children('input');
    if (name=='label') {
      return input.attr('value');
    }
  };

 })(luban, jQuery);


// End of file
