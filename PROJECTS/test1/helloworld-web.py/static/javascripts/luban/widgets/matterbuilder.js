// -*- JavaScript -*-
//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
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
  dmp.onmatterbuilder = dmp._onElement;

  // take a list of atoms and generate a "div" that has the scene
  function createScene(lattice, atoms) {
	  
    // the viewer is called below through initClient()...just make sure the library is available
    
    function createViewContainer() {
      var table = tag('table'); table.addClass('o3d-scence-container');
      table.width(400); table.height(400);
      
      var tr = tag('tr'); 
      table.append(tr);

      var td = tag('td'); 
      tr.append(td);
      td.css('height', '100%');
      
      var div = tag('div', {id:'o3d'}); 
      td.append(div);
      div.css('width', '100%');
      div.css('height', '100%');

      var loading = tag('div', {id:'loading'}); 
      td.append(loading);
      loading.css('color', 'red');
      return table;
    }

    //var newatoms;
    var container = createViewContainer();
    //container.bind('append', {newatoms:atoms}, function(){initClient(newatoms)});
    var callback = function () {initClient(lattice, atoms);};
    container.bind('append', callback);
    //container.unload(uninit);
    //var body = $('body');
    //body.load(init); body.unload(uninit);
    return container;
  }
  // matterbuilders
  ef.matterbuilder = function (kwds, docmill, parent) {
    var Class = kwds.Class;
    var id = kwds.id;
    var ret = tag('div', {'id': id});

    ret.addClass(Class);
    ret.addClass('luban-matterbuilder');

    var onclick = kwds.onclick;
    if (onclick) {
      ret.click( function() { docmill.compile(onclick); return false; } );
    }
    ret = ret.lubanElement('matterbuilder');
    if (parent) {parent.add(ret);}

	var lattice = kwds.lattice;
    var atoms = kwds.atoms;
    var scene = createScene(lattice, atoms);
    ret.jqueryelem.append(scene);
    ret.jqueryelem.bind('destroy', uninit);
    
    //ret.jqueryelem.data('atoms', atoms);
    
    scene.trigger('append');

    return ret;
  };

  widgets.matterbuilder = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  // self check
  widgets.matterbuilder.selfcheck = function() {
    var required;
    try {
      required = o3djs;
    } catch (e) {
      //throw;
      return true;
    }
    var base = required.base;
    if (base == null) {return true;}
    if (base.setErrorHandler == null) {return true;}
    return false;
  };
  widgets.matterbuilder.prototype = new widgets.base ();

})(luban, jQuery);


// End of file
