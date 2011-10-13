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

  // helpers
  // check if a widget extension is loaded ok.
  // it is always attached to a "download" object with has a "widget" property
  // giving the name of the widget.
  // the check is done by checking
  //   * whether the document mill handler is defined
  //   * whether the widget factory is defined
  //   * whether the selfcheck method of the widget object passes
  function widget_extension_check() {
    var w = this.widget;

    var f=eval('luban.docmill.on'+w);
    var wc=eval('luban.widgets.'+w);
    if (f==null || wc==null) {return 1;}
    if (wc.selfcheck==null) {return;}
    return wc.selfcheck();
  }

  //
  luban.widgets.implementationRegistry = {};
  luban.widgets.loadWidgetsImplementation = function( widgets, callback ) {  
    //
    var lw = luban.widgets, lu = luban.utils;
    var jdm = new lu.jsDownloadManager();
    //
    var check = widget_extension_check;

    var pass = function() {return 0;};

    for (var i in widgets) {
      var j;
      
      var w= widgets[i];
      var files = lw.getWidgetLibFiles(w);

      //
      for (j in files.css) {lu.loadCSS(files.css[j]);}

      // 
      var impl_js_sig = '/widgets/'+w+'.js';

      for (j in files.js) {
	var js = files.js[j], c;
	if (js.search(impl_js_sig)!=-1) {c = check;}
	else {c = pass;}
	var d = {url: js, 'check': c, widget: w};
	jdm.addDownload(d);
      }
    }
    jdm.start(callback);
  };

  luban.widgets.getWidgetLibFiles = function (widget) {
    var def_impl_js = 'luban/widgets/'+widget+'.js', found;
    var jsbase = luban.configuration.javascripts_base;

    var impl = luban.widgets.implementationRegistry[widget];
    if (!impl) {
      impl = luban.widgets.implementationRegistry[widget] = {
	'javascripts': [jsbase+'/'+def_impl_js],
	'stylesheets': []
      };
    }

    // look for default implementation file and establish the list of
    // js files to load
    var jslist=[], js;
    for (var i in impl.javascripts) {
      js = impl.javascripts[i];
      jslist.push(js);
      if (js.search('/'+widget+'.js')!=-1) {found = 1;}
    }
    // if not found load it
    if (!found) {
      js = jsbase+'/'+def_impl_js;
      jslist.push(js);
    }

    return {'js': jslist, 'css': impl.stylesheets};
  };


  // form-related action handlers
  //  shortcut
  var lap = luban.actioncompiler.prototype;
  lap.onformfieldshowerrormessage = function(action) {
    return this.onformfieldshowerror(action);
  };
  lap.onformfieldshowerror = function(action) {
    var params = action.params;
    var message = params.message;
    element = this.dispatch(action.element);
    element._je.find('.error').text(message);
    element._je.find('.error-sign').show();
    element._je.find('.error-sign').click();
  };
  
  
  // common utility functions for default implementation of form fields
  // formfield
  widgets.formfield = function( kwds, docmill) {
    var id = kwds.id;
    
    var div = tag('div', {'id': id}); 

    div.addClass('luban-formfield');
    // the next line is for backward compatibility
    div.addClass('formfield');
    if (kwds.Class) {div.addClass(kwds.Class);}

    var div1 = tag('div'); div.append(div1); div1.addClass('label-container');

    if (kwds.required) {
      var span = tag('span'); span.addClass("formfieldRequired"); div1.append(span);
      span.text('&nbsp;');
    }

    var labeldiv = tag('div'); div1.append(labeldiv);
    var label = tag('label', {'for': id}); labeldiv.append(label);
    if (kwds.label) {
      label.text(kwds.label);
    } else {
      labeldiv.hide();
    }

    var help = kwds.help;
    if (help == null) {help = '';}
    var helpa = tag('a'); 
    div.append(helpa);
    
    helpa.addClass('help');
    // this is for backward compatibility
    helpa.addClass('formfieldHelp');
    if (help) {
      helpa.text(help);
    } else {
      helpa.hide();
    }
    var table = tag('table'); div.append(table);
    var tbody = tag('tbody'); table.append(tbody);
    var row = tag('tr'); tbody.append(row);
    var cell1 = tag('td'); row.append(cell1); cell1.addClass('input-container');
    var cell2 = tag('td'); row.append(cell2);
    
    var p = tag('span'); p.text('!'); cell2.append(p);  
    p.addClass('error-sign');

    var error = kwds.error;
    var errordiv = tag('div'); div.append(errordiv);
    errordiv.addClass('error');
    if (error) {
      errordiv.text(error);
      errordiv.hide();
    }
    else {
      errordiv.hide();
      p.hide();
    }
    errordiv.click(function() {$(this).hide();});
    p.click(function() {
	//var offset = $(this).offset();
	var pos = $(this).position();
	//errordiv.offset(offset);
	//errordiv.css('top', offset.top-10);
	//errordiv.css('left', offset.left+17);
	errordiv.css('top', pos.top-10);
	errordiv.css('left', pos.left+17);
	errordiv.toggle('fast');
      });

    var onclick = kwds.onclick;
    if (onclick) 
      { div.click( function() { docmill.compile(onclick); return false; } ); }

    return div;
  };
  widgets.formfield_setAttribute = function(formfield, attrs) {
    var id = attrs.id;
    var label;
    if (id!=null) {
      label = formfield.find('label');
      label.attr('for', id);
    }

    var name = attrs.name;
    if (name!=null) {
      var inputs = formfield.find('input');
      inputs.attr('name', widgets.prependActor(name));
    }
    
    var Class = attrs.Class;
    if (Class) {
      formfield.removeClass();
      formfield.addClass('formfield');
      formfield.addClass(Class);
    }

    var helpdiv = formfield.children('.help');
    var help = attrs.help;
    if (help != null) {
      if (help) {
	helpdiv.text(help).show();
      } else {
	helpdiv.hide();
      }
    }

    var errordiv = formfield.children('.error');
    var error = attrs.error;
    if (error != null) {
      if (error) {
	errordiv.text(error).show();
      } else {
	errordiv.hide();
      }
    }

    var labelcontainerdiv = formfield.children('div.label-container');
    var labeldiv = labelcontainerdiv.children('div');
    label = attrs.label;
    if (label != null) {
      if (label) {
	labeldiv.text(label).show();
      } else {
	labeldiv.hide();
      }
    }
  };

  
  widgets.formfield_getAttribute = function(formfield, name) {
    if (name=='Class') {return formfield.attr('class');}
    if (name=='help') {
      var helpdiv = formfield.children('div.help');
      return helpdiv.text();
    }
    if (name=='error') {
      var errordiv = formfield.children('div.error');
      return errordiv.text();
    }
    if (name=='label') {
      var labelcontainerdiv = formfield.children('div.label-container');
      var labeldiv = labelcontainerdiv.children('div');
      return labeldiv.text();
    }
  };
  
  // helpers
  // prepend 'actor.' to keys
  widgets.prependActor = function (s) {
    return 'actor.'+s;
  };

 })(luban, jQuery);


// End of file
