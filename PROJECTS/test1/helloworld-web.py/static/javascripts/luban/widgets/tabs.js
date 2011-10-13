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
  dmp.ontabs = dmp.ontab = dmp._onContainer;


  // actioncompiler handlers
  var lap=luban.actioncompiler.prototype;
  lap.ontabselect = function(action) {
    var tab = this.dispatch(action.element);
    tab.select();
  };

  
  // tabs
  //  factory
  ef.tabs = function(kwds, docmill, parent) {

    var div = tag('div', {id: kwds.id} );

    var Class = kwds.Class;
    if (Class) {div.addClass(Class);}

    var ul = tag('ul');
    div.append(ul);

    var onclick = kwds.onclick;
    if (onclick) {
      div.click( function() { docmill.compile(onclick); return false; } );
    }
    var ret = div.lubanElement('tabs');
    if (parent) {parent.add(ret);}
    
    // call jquery tabs ctor
    div.tabs();

    //
    div.bind('tabsselect', function(event, ui) {
	var panel = $(ui.panel);
	var tabsdiv = panel.parent();
	if (tabsdiv.attr('id') != $(this).attr('id')) {return;}
	var panels = tabsdiv.children('div');
	var index = panels.index(panel);
	var selected = tabsdiv.tabs('option', 'selected');
	if (index!=selected)
	  {panel.trigger('luban-tabselect');}
      });
    
    return ret;
  };
  //  object
  widgets.tabs = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.tabs.prototype = new widgets.base ();
  widgets.tabs.prototype.createTab = function(tab, docmill) {
    var id = tab.id;
    var url = '#'+id;
    var label = tab.label;
    this._je.tabs('add', url, label);
    var tabdiv = $(url);

    var Class = tab.Class;
    if (Class) {tabdiv.addClass(Class);}
    
    // click
    var onclick = tab.onclick;
    var callback = function() { 
      if (onclick)
	{docmill.compile(onclick);}
      //return false;
    };
    tabdiv.bind('luban-tabselect', callback);
    tabdiv.click(callback);

    // select
    var onselect = tab.onselect;
    var callback2 = function() { 
      if (onselect)
	{docmill.compile(onselect);}
      return false;
    };
    tabdiv.bind('luban-tabselect', callback2);

    // 
    tabdiv.bind('luban-tabselect', function() {$(this).trigger('resize');});

    // the last li corresponds to this tab
    var lis = this._je.children('ul').children('li');
    var lastli = $(lis[lis.length-1]);
    lastli.attr('target', id);
    
    //
    if (tab.selected) {this._je.tabs('select', lis.length-1);}
    
    return tabdiv.lubanElement('tab');
  };
  widgets.tabs.prototype.add = function (subelem) {
    throw "should not reach here";
  };


  // tab
  ef.tab = function(kwds, docmill, parent) {
    var widget = parent.createTab(kwds, docmill);
    return widget;
  };
  //  object
  widgets.tab = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.tab.prototype = new widgets.base();
  // get 0-based index of me in the tabs
  widgets.tab.prototype.getIndex = function() {
    var div = this._je;
    var parent = div.parent();
    var divs = parent.children('div');
    return divs.index(div);
  };
  widgets.tab.prototype.destroy = function() {
    var index = this.getIndex();
    var parent = this.getParent();
    parent._je.tabs('remove', index);
  };
  widgets.tab.prototype.setAttribute = function (attrs) {
    var div = this._je;
    var parent = div.parent();
    var ul = parent.children('ul');
    var id = div.attr('id');
    
    var label = attrs.label;
    if (label) {
      var li = ul.find("li[target='"+id+"']");
      var span = li.find('span');
      span.text(label);
    }
  };
  widgets.tab.prototype.select = function () {
    var index = this.getIndex();
    var tabs = this.getParent();
    tabs._je.tabs('select', index);
  };
  widgets.tab.prototype.enable = function() {
    var index = this.getIndex();
    var tabs = this.getParent();
    tabs._je.tabs('enable', index);
  };
  widgets.tab.prototype.disable = function() {
    var index = this.getIndex();
    var tabs = this.getParent();
    tabs._je.tabs('disable', index);
  };

 })(luban, jQuery);


// End of file
