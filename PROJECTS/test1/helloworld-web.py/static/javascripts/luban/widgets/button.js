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
  dmp.onbutton = dmp._onElement;

  
  // button
  //  factory
  ef.button = function(kwds, docmill, parent) {
    var id = kwds.id;
    var div = tag('div', {"id": id}); div.addClass('luban-button-container');
    if (kwds.Class) { div.addClass(kwds.Class); }
//     var table = tag('table');  table.addClass('luban-button-container');
//     div.append(table);
//     var tr = tag('tr'); table.append(tr);
//     var td = tag('td'); td.addClass('luban-button'); tr.append(td);
    var a = tag('a'); //td.append(a);
    div.append(a); a.addClass('luban-button');

    var tip = kwds.tip;
    if (tip) {
      a.attr('title', tip);
      a.tooltip({showURL: false});
    }

    var icon = kwds.icon; var img;
    if (icon != null && icon != '') {
      img = tag('img', {'src': luban.iconpath(icon)});
      a.append(img);
      img.addClass('luban-buttonIcon');
    }

    var label = kwds.label; var span;
    span = tag('span');
    a.append(span);
    span.text(label);

    var onclick = kwds.onclick;
    if (onclick != null && onclick != '') {
      a.click( function() { docmill.compile(onclick); return false; } );
    }
    var ret = div.lubanElement('button');
    if (parent) {parent.add(ret);}
    return ret;
  };
  //  object
  widgets.button = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.button.prototype = new widgets.base ();
  widgets.button.prototype.setAttribute = function(attrs) {
    var je = this._je;

    var a = je.children('a');
    if (attrs.tip != null) { a.attr('title', attrs.tip); }

    var span = a.children('span');
    if (attrs.label != null) { span.text(attrs.label); }

    var img = a.children('img');
    if (attrs.icon != null) {
      var icon = attrs.icon;
      if (!icon) {
	if (img.length) { img.remove(); }
      } else {
	if (img.length===0) {
	  img = tag('img'); span.before(img);
	}
	img.attr('src', luban.iconpath(attrs.icon));
      }
    }
  };

 })(luban, jQuery);


// End of file
