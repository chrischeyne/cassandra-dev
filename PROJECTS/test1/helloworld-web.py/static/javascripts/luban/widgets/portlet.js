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

  // declare local helper functions
  var _createIcon;

  // aliases
  var ef = luban.elementFactory;
  var widgets = luban.widgets;
  var tag = luban.utils.tag;


// documentmill handler
  var dmp = luban.documentmill.prototype;
  dmp.onportlet = dmp._onContainer;
  dmp.onportletitem = dmp._onElement;
 

  // actioncompiler handlers
  var lap=luban.actioncompiler.prototype;
  lap.onportletitemselect = function(action) {
    var item = this.dispatch(action.element);
    item.select();
  };


  // portlet
  //  factory
  ef.portlet = function(kwds, docmill, parent) {
    var vpaddiv = tag('div', {id: kwds.id});
    vpaddiv.addClass('luban-portlet-padding');
    var div = tag('div'); div.addClass('luban-portlet');
    vpaddiv.append(div);
    
    var title = kwds.title;
    if (title != null && title != '') {
      var h5 = tag('h5'); 
      h5.addClass('luban-portlet-title');
      h5.text(title);
      div.append(h5); 
    }
    
    var bodydiv = tag('div'); div.append(bodydiv);
    bodydiv.addClass('luban-portlet-body');
    
    var ret= vpaddiv.lubanElement('portlet');
    if (parent) {parent.add(ret);}
    return ret;
  };
  //  object
  widgets.portlet = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.portlet.prototype = new widgets.base ();
  widgets.portlet.prototype.add = function (subelem) {
    var container = this.jqueryelem.children('div.luban-portlet');
    var body = container.children('div.luban-portlet-body');
    body.append(subelem.jqueryelem);
  };
  widgets.portlet.prototype.setSelectedItem = function (item) {
    var container = this.jqueryelem.children('div.luban-portlet');
    var body = container.children('div.luban-portlet-body');
    body.children('div.luban-portletitem-container').removeClass('selected');
    item.jqueryelem.addClass('selected');
  };
  widgets.portlet.prototype.setAttribute = function(attrs) {
    var je = this._je;
    
    var titlediv = je.find('.luban-portlet-title');
    var title = attrs.title;
    if (title != null) {
      if (!title) {titlediv.remove();}
      else {
	if (titlediv.length===0) {
	  var h5 = tag('h5'); 
	  h5.addClass('luban-portlet-title');
	  je.find('div.luban-portlet-body').before(h5);
	  titlediv = h5;
	}
	titlediv.text(title);
      }
    }
  };


  // portletitem
  ef.portletitem = function(kwds, docmill, parent) {

    var visualpadding = tag('div', {id: kwds.id}); 
    visualpadding.addClass('luban-portletitem-container');

    var containerdiv = tag('div'); visualpadding.append(containerdiv);
    containerdiv.addClass('luban-portletitem-content');

    var a = tag('a');
    a.addClass('luban-portletitem');
    containerdiv.append(a);
    
    var tip = kwds.tip;
    if (tip) {
      a.attr('title', tip);
      a.tooltip({showURL: false});
    }

    // reserve a div for icon
    var icondiv = tag('div'); icondiv.addClass('luban-portletitem-icon-container');
    a.append(icondiv);
    // add icon if exists
    var icon = kwds.icon;
    if (icon != null && icon != '') {
      var img = _createIcon(icon);
      img.addClass('luban-portletitem-icon');
      icondiv.append(img);
    }
     
    // text
    span = tag('span');
    span.addClass('luban-portletitem-text');
    span.text(kwds.label);
    a.append(span);

    // callbacks
    // click
    var onclick = kwds.onclick; var id = kwds.id;
    a.click( function() { 
	var item = $('#'+id).lubanElement();
	item.select();
	if (onclick)
	  {docmill.compile(onclick); return false;}
      } );
    var onselect = kwds.onselect; 
    if (onselect) {
      visualpadding.bind('luban-select', function() {
	  docmill.compile(onselect); return false;
	});
    }
    // selected?
    if (kwds.selected) {visualpadding.addClass('selected');}
    var ret = visualpadding.lubanElement('portletitem');
    if (parent) {parent.add(ret);}
    return ret;
  };
  //  object
  widgets.portletitem = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.portletitem.prototype = new widgets.base ();
  widgets.portletitem.prototype.getParent = function() {
    // see portlet.add and portlet factory
    var item = this._je;
    var body = item.parent();
    var portlet = body.parent();
    var vpad = portlet.parent();
    return vpad.lubanElement();
  };
  widgets.portletitem.prototype.select = function () {
    var parent = this.getParent();
    parent.setSelectedItem(this);
    this._je.trigger('luban-select');
  };
  widgets.portletitem.prototype.setAttribute = function(attrs) {
    var je = this._je;
    var a = je.find('a');

    var s = attrs.selected;
    if (s!=null) {
      if (s) {je.addClass('selected');}
      else {je.removeClass('selected');}
    }
    var tip = attrs.tip;
    if (tip!=null) {a.attr('title', tip);}

    var span = a.find('span');
    var label = attrs.label;
    if (label!=null) {span.text(label);}

    var img = a.find('img.luban-portletitem-icon');
    var icon = attrs.icon;
    if (icon!=null) {
      if (img.length===0) {
	img = _createIcon(icon); 
	a.find('.luban-portletitem-icon-container').append(img);
      }
      else {img.attr('src', luban.iconpath(icon));}
    }
  };
  _createIcon = function(icon) {
    return tag('img', {height: 16, width: 16, src: luban.iconpath(icon)});
  };


 })(luban, jQuery);


// End of file
