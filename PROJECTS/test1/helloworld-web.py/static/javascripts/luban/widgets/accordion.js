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


  // documentmill handlers
  var dmp = luban.documentmill.prototype;
  dmp.onaccordion = function(accordion) {
    var type = accordion.type;
    var factory = luban.elementFactory[type];
    var elem = factory(accordion, this, this._parent, {plain_element: true});
    
    var contents = accordion.contents;
    if (contents == null) {return elem;}
    
    var selected_section = null;
    for (var i in contents) {
      var section = contents[i];
      
      this._parent = elem;
      var subelem = this.dispatch(section);
      
      var selected = section.selected;
      if (selected_section!=null && selected) 
	{throw "documentmill.onaccordion: multiple selected sections";}
      
      //if (selected) selected_section = section.id;
      if (selected) {selected_section = parseInt(i, 10);}
      
    }
    
    var opts = $.extend( {}, factory.defaultopts, {active: selected_section});
    elem._je.accordion(opts);
    
    // bind event handler
    var onchange = elem._je.data('onchange-func');
    if (onchange != null) {
      elem._je.bind('accordionchange', onchange);
    }
    return elem;
  };

  dmp.onaccordionsection = function(section) {
    var parent = this._parent;
    var sectionelem = parent.createSection(section, {plain_element: true});
    
    var contents = section.contents;
    if (contents != null) {
      
      for (var i in contents) {
	this._parent = sectionelem;
	var subdoc = contents[i];
	if (typeof(subdoc) == 'string') {
	  sectionelem._je.append(subdoc);
	} else {
	  this.dispatch(subdoc);
	}
      }
      
    }
    return sectionelem;
  };


  // actioncompiler handlers
  var lap=luban.actioncompiler.prototype;
  lap.onaccordioncreatesection = function(action) {
    var accordion = this.dispatch(action.element);
    accordion.createSection(action.params);
  };
  lap.onaccordionremovesection = function(action) {
    var accordion = this.dispatch(action.element);
    accordion.removeSection(action.params.id);
  };

  
  // accordion
  //  factory
  ef.accordion = function(kwds, docmill, parent, opts) {
    var plain_element = false;
    if (opts != null) {
      plain_element = opts.plain_element;
    }
    
    var div = tag('div', {id: kwds.id} );
    
    if (kwds.Class) {
      div.addClass(kwds.Class);
    }
    
    if (!plain_element) 
      {div.accordion(ef.accordion.defaultopts);}

    var onchange = kwds.onchange;
    if (onchange != null && onchange != '') {
      div.data('onchange-func', function(evt, ui) {
	  var postfixlen = 'label'.length;

	  var oldsection = ui.oldHeader.attr('id');
	  oldsection = oldsection.substr(0,oldsection.length-postfixlen);

	  var newsection = ui.newHeader.attr('id');
	  newsection = newsection.substr(0,newsection.length-postfixlen);

	  div.data('changed-data', {
	      'oldsection': oldsection, 'newsection': newsection});

	  docmill.compile(onchange); 

	  return false;

	});
      if (!plain_element)
	{ div.bind('accordionchange', div.data('onchange-func')); }
    }

    var ret = div.lubanElement('accordion');
    if (parent) {parent.add(ret);}
    
    return ret;
  };
  ef.accordion.defaultopts = {
    //fillSpace: true,
  autoHeight: false
  };
  //  object
  widgets.accordion = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.accordion.prototype = new widgets.base ();
  widgets.accordion.prototype.createSection = function(section, opts) { 
    var plain_element = false;
    if (opts != null) {
      plain_element = opts.plain_element;
    }
    
    var id = section.id;
    var label = section.label;
    
    var h3 = tag('h3', {'id': id+'label'});
    var a = tag('a'); h3.append(a);
    a.text(label);
    this._je.append(h3);
    
    var div = tag('div', {'id': id});
    this._je.append(div);
    
    // recreate the accordion
    if (!plain_element) {
      this._je.accordion('destroy');
      this._je.accordion(ef.accordion.defaultopts);

      // select the last section
      this._je.accordion('activate', $(h3));

    var onchange = div.data('onchange-func');
    if (onchange != null)
      {this._je.bind('accordionchange', onchange);}
    }

    return div.lubanElement('accordionsection');
  };
  widgets.accordion.prototype.removeSection = function(id) {
    this._je.accordion('destroy');
    var h3 = $('#'+id+'label');
    var div = $('#'+id);
    h3.remove();
    div.remove();
    
    // recreate the accordion
    this._je.accordion(ef.accordion.defaultopts);

    // all headers
    var headers = this._je.children('.ui-accordion-header');
    if (headers.length>1) {
      // select the first section
      this._je.accordion('activate', headers[0]);
    }
    
    //
    var onchange = div.data('onchange-func');
    if (onchange != null)
      { this._je.bind('accordionchange', onchange); }
    
    return;
  };
  widgets.accordion.prototype.add = function (subelem) {
    throw "should not reach here";
  };


  // accordionsection
  //  accordionsection does not have standalone factory. only created from accordion.
  //  object
  widgets.accordionsection = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.accordionsection.prototype = new widgets.base ();
  widgets.accordionsection.prototype.setAttribute = function (attrs) {
    var label = attrs.label;
    if (label != null) {
      var id = this._je.attr('id');
      var labelid = id+'label';
      var labelje = $('#'+labelid);
      labelje.find('a').text(label);
    }
  };
  widgets.accordionsection.prototype.destroy = function() {
    var div = this._je;
    var id = div.attr('id');
    
    var labelh3 = $(id+'label');
    labelh3.remove();
    
    var parent = div.parent();
    div.remove();
    
    parent.accordion('destroy');
    parent.accordion(ef.accordion.defaultopts);
    
    var onchange = div.data('onchange-func');
    if (onchange != null)
      { parent.bind('accordionchange', onchange); }
  };


 })(luban, jQuery);


// End of file
