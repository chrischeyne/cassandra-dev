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
  dmp.onformselectorfield = dmp._onElement;

  // actioncompiler handler
  var lap = luban.actioncompiler.prototype;
  lap.onformselectorfieldshowerrormessage = function(action) {
    this.onformfieldshowerrormessage(action);
  };
  lap.onformselectorfieldshowerror = function(action) {
    this.onformfieldshowerror(action);
  };
  lap.onformselectorfieldgetselection = function(action) {
    var element = this.dispatch(action.element);
    return element.getSelection();
  };
  lap.onformselectorfieldgetselectedlabel = function(action) {
    var element = this.dispatch(action.element);
    return element.getSelectedLabel();
  };
  lap.onformselectorfieldaddoption = function(action) {
    var element = this.dispatch(action.element);
    return element.addOption(action.params);
  };


  // 
  var formfield = widgets.formfield;
  var formfield_setAttribute = widgets.formfield_setAttribute;
  var formfield_getAttribute = widgets.formfield_getAttribute;
  var prependActor = widgets.prependActor;
  

  // formselectorfield
  ef.formselectorfield = function(kwds, docmill, parent) {
    var div = formfield(kwds, docmill), input_container = div.find('.input-container');
    div.addClass('luban-formselectorfield');

    var ret = div.lubanElement('formselectorfield');
    if (parent) {parent.add(ret);}

    var field = kwds;
    var args =  {
      'name': prependActor(field.name)
    };

    var input = tag('select', args);  input_container.append(input);

    if (kwds.tip) {
      var tip = kwds.tip;
      input.attr('title', tip);
      input.tooltip({showURL: false});
    }
    
    ret.setAttribute({entries: field.entries});
    
    var selection = field.selection;
    if (selection) {ret.setSelection(selection);}
    else
      if (field.value) {ret.setAttribute({value: field.value});}

    // save the current value
    ret.saveCurrentValue();
    var onchange = kwds.onchange;
    if (onchange) {
      input.change(function() {
	  ret.saveCurrentValue();
	  ret.setEventData('changed', {
	      'oldvalue': ret.getOldValue(), 
		'value': ret.getAttribute('value')}
	    );
	  docmill.compile(onchange); return false; 
	});
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
  widgets.formselectorfield = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.formselectorfield.prototype = new widgets.base ();
  widgets.formselectorfield.prototype.saveCurrentValue = function () {
    var w = this._je;
    // save the current "current-value" as "old-value"
    var v = w.data('current-value');
    w.data('old-value', v);
    // save the real current value as "current-value"
    v = this.getAttribute('value');
    w.data('current-value', v);
  };
  widgets.formselectorfield.prototype.getOldValue = function () {
    return this._je.data('old-value');
  };
  widgets.formselectorfield.prototype.getInputWidget = function () {
    return this._je.find('select');
  };
  widgets.formselectorfield.prototype.focus = function () {
    var je = this._je;
    var input = this.getInputWidget();
    input.focus();
  };
  widgets.formselectorfield.prototype.setAttribute = function (attrs) {
    var je = this._je;
    formfield_setAttribute(je, attrs);
    
    var select  = this.getInputWidget();

    var name = attrs.name;
    if (name!=null) {
      select.attr('name', prependActor(name));
    }

    // entries
    var entries = attrs.entries;
    if (entries!=null) {
      this.setEntires(entries);
    }
    // selection and value should be the last to work on.
    var selection = attrs.selection, value = attrs.value;
    if (value!=null && selection!=null) {
      throw "formselectorfield.setAttribute: both value and selection are specified.";
    }
    if (selection!=null) {
      this.setSelection(selection);
    } else {
      if (value!=null) {
	select.children(":selected").removeAttr('selected');
	select.children("option[value='"+value+"']").attr('selected', 1);
      }
    }
  };
  widgets.formselectorfield.prototype.setEntires = function(entries) {
    var input = this.getInputWidget(); input.empty();
    for (var i in entries) {
      var entry = entries[i];
      var value = entry.value, description;
      if (value == null) {
	value = entry[0]; description = entry[1];
      } else {
	description = entry.description;
      }
      var args = {'value': value};
      var o = tag('option', args); input.append(o);
      o.text(description);
    }
  };
  widgets.formselectorfield.prototype.getAttribute = function (name) {
    var je = this._je;
    var ret = formfield_getAttribute(name);
    if (ret) {return ret;}
    if (name=='selection') {return this.getSelection();}
    if (name=='value') {return this.getInputWidget().children(':selected').val();}
  };
  widgets.formselectorfield.prototype.getSelection = function () {
    var je = this._je;
    return je.find(':selected').text();
  };
  widgets.formselectorfield.prototype.setSelection = function (selection) {
    var input = this.getInputWidget();
    
    // first check selection as option label
    var opt1 = input.find('option:contains('+selection+')'), found;
    
    if (opt1.length>=1) {
      // have to go through them and find the one
      var f = function () {
	if ( $(this).text() == selection ) {found = $(this);}
      };
      opt1.each(f);
    }
    
    if (!found) {
      // try selection as index
      var opt2 = input.children('option[value='+selection+']');
      if (opt2.length>1) {throw "should not happen";}
      if (opt2.length==1) {found = opt2;}
    }
    
    if (found) {
      input.children(":selected").removeAttr('selected');
      found.attr('selected', 'selected');
    }
  };
  widgets.formselectorfield.prototype.getSelectedLabel = function () {
    var je = this._je;
    return je.find(':selected').text();
  };
  widgets.formselectorfield.prototype.addOption = function (opt) {
    var je = this._je;
    var select  = this.getInputWidget();

    var args = {value:opt.value};
    var o = tag('option', args); select.append(o);
    o.text(opt.label);
    
    if (opt.selected) {
      this.setAttribute({selection: opt.label});
    }
    return;
  };


 })(luban, jQuery);


// End of file
