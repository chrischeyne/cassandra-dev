// -*- JavaScript -*-
//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
//                                   Jiao Lin
//                      California Institute of Technology
//                       (C) 2008-2010 All Rights Reserved  
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
  dmp.onnewsticker = function (container) {
    var le = this._onContainer(container);

    var delay = container.delay;
    // convert to microseconds
    if (delay != null) {delay=delay*1000;}

    le.getul().newsTicker(delay);
    return le;
  };
  dmp.onnewstickeritem = dmp._onElement;
 

  // actioncompiler handlers
  var lap=luban.actioncompiler.prototype;

  // newsticker
  //  factory
  ef.newsticker = function(kwds, docmill, parent) {
    var containerdiv = tag('div', {id: kwds.id});
    containerdiv.addClass('luban-newsticker');
    
    var table = tag('table'); containerdiv.append(table);
    var tr = tag('tr'); table.append(tr);
    var titletd = tag('td'); tr.append(titletd);
    var newstd = tag('td'); tr.append(newstd);
    
    var p = tag('p'); titletd.append(p);
    p.addClass('title');
    var title = kwds.title;
    if (title) {p.text(title);}
    else {p.hide();}
    
    // needs an unordered list
    var ul = tag("ul"); newstd.append(ul);
    ul.addClass('newsticker');
    
    var ret= containerdiv.lubanElement('newsticker');
    if (parent) {parent.add(ret);}

    var onrefresh = kwds.onrefresh;
    if (onrefresh) {
      var f1 = function() {
	docmill.compile(onrefresh);
      };
      var t = kwds.refreshtime;
      if (t==null) {
	var delay  = kwds.delay;
	if (delay==null) {delay = 4;}
	t = delay * 100;
      }
      t *= 1000;
      var interval = setInterval(f1, t);
      containerdiv.data("refresh-interval", interval);

      containerdiv.bind('destroy', function() {
	  var interval = $(this).data('refresh-interval');
	  clearInterval(interval);
	  return false;
	});
    }
    
    return ret;
  };
  //  object
  widgets.newsticker = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.newsticker.prototype = new widgets.base ();
  widgets.newsticker.prototype.add = function (subelem) {
    var ul = this.getul();
    ul.append(subelem.jqueryelem);
  };
  widgets.newsticker.prototype.getul = function() {
    return this.jqueryelem.find('ul.newsticker');
  };

  // newstickeritem
  ef.newstickeritem = function(kwds, docmill, parent) {
    var li = tag('li'); li.addClass('luban-newstickeritem');
    li.text(kwds.text.join('\n'));

    var ret = li.lubanElement('newstickeritem');
    if (parent) {parent.add(ret);}

    var onclick = kwds.onclick;
    if (onclick) {
      li.click( function() { docmill.compile(onclick); return false; } );
    }
    li.bind('destroy', function() {return false;});

    return ret;
  };
  //  object
  widgets.newstickeritem = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.newstickeritem.prototype = new widgets.base ();

 })(luban, jQuery);


// End of file
