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
  dmp.onformradiobox = dmp._onElement;

  // 
  var formfield = widgets.formfield;
  var formfield_setAttribute = widgets.formfield_setAttribute;
  var formfield_getAttribute = widgets.formfield_getAttribute;
  var prependActor = widgets.prependActor;
  

  // formradiobox
  ef.formradiobox = function(kwds, docmill, parent) {
    var div = formfield(kwds, docmill), input_container = div.find('.input-container');
    div.addClass('luban-formradiobox');

    if (kwds.tip) {
      var tip = kwds.tip;
      div.attr('title', tip);
      div.tooltip({showURL: false});
    }

    var field = kwds;
    var args =  {
      'name': prependActor(field.name),
      'type': 'radio'
    };

    var selection = kwds.selection;
    
    for (var i in field.entries) {
      var args1 = $.extend({}, args);
      var entry = field.entries[i];
      var value = entry.value, description;
      if (value == null) {
	value = entry[0]; description = entry[1];
      } else {
	description = entry.description;
      }
      if (selection != null && (selection == description|selection==value))
	{ args1['checked'] = 'checked'; }
      args1['value']=value;
      var div1 = tag('div'); div1.addClass('luban-radiobutton-container');
      input_container.append(div1);
      var input = tag('input', args1);
      var text = tag('label'); text.text(description);
      div1.append(input);
      div1.append(text);
    }

    // XXX: onchange?
    var ret = div.lubanElement('formradiobox');
    if (parent) {parent.add(ret);}
    return ret;
  };

  widgets.formradiobox = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.formradiobox.prototype = new widgets.base ();
  widgets.formradiobox.prototype.getInputWidgets = function(checked) {
    if (checked)
      {return this._je.find('input:checked');}
    return this._je.find('input');
  };
  widgets.formradiobox.prototype.setAttribute = function (attrs) {
    var je = this._je;
    formfield_setAttribute(je, attrs);
    
    var value = attrs.value;
    if (value != null) {
      var checked = this.getInputWidgets('checked');
      if (Number(value)!=Number(checked.val())) {
	checked.removeAttr('checked');
	je.find("input[value='"+value+"']").attr('checked', 'checked');
      }
    }
  };
  widgets.formradiobox.prototype.getAttribute = function (name) {
    var je = this._je;
    var ret = formfield_getAttribute(name);
    if (ret) {return ret;}
    if (name=='value') {
      var checked = this.getInputWidgets('checked');
      return Number(checked.val());
    }
  };


 })(luban, jQuery);


// End of file
