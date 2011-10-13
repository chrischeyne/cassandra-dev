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
  dmp.ontreeview = function(treeview) {
      var type = treeview.type;
      var factory = luban.elementFactory[type];
      var elem = factory(treeview, this);
      var parent = this._parent;
      if (parent != null) {parent.add(elem);}
      // 
      // this is a hack to make sure every li has a reference to the tree container
      // jsTree 0.9.9 brutally remove all data and events associated with li so we have to
      // do this.
      var treeje = elem._je;
      treeje.data('treeje', treeje);

      var root = treeview.root;
      if (root) {
	this._parent = elem;
	this.dispatch(root);
      }

      var rules = {};
      if (treeview.draggable) {
	rules.draggable = 'all';
      }
      var callback = {};
      callback.onselect = onselect;
      if (treeview.onnodemoving) {
	callback.onmove = elem._je.data('onnodemoving-func');
      }
      var opts = {
	  'rules': rules,
	  'callback': callback
      };
      elem._je.tree(opts);
      // $.tree_reference(treeview.id).open_all();
      // elem._je.treeview();
      return elem;
  };
  dmp.ontreeviewbranch = dmp._onContainer;
  dmp.ontreeviewleaf = dmp._onElement;

  function onselect(node, tree_obj) {
    var $node = $(node);
    var treejs = tree_obj.container;
    var key = $node.attr('id')+'-onclick-callback';
    var f = treejs.data(key);
    if (f) {f();}
  }

  // actioncompiler handler
  var lap = luban.actioncompiler.prototype;
  //  treeview
  lap.ontreeviewsetroot = function(action) {
    var treeview = action.treeview;
    treeview = this.dispatch(treeview);
    
    var root = this.docmill.render(action.root);
    treeview.setRoot(root);
  };

  lap.ontreeviewaddbranch = function(action) {
    var treeview = action.treeview;
    treeview = this.dispatch(treeview);
    
    var referencenode = this.dispatch(action.referencenode);
    
    treeview.addNode(referencenode, action.newnode, action.position);
  };
  
  lap.ontreeviewcloseall = function(action) {
    var treeview = this.dispatch(action.element);
    
    treeview.closeAll();
  };
  
  lap.ontreeviewopen = function(action) {
    var treeview = this.dispatch(action.element);
    
    treeview.open(action.params.branch);
  };
  
  lap.ontreeviewclose = function(action) {
    var treeview = this.dispatch(action.element);
    
    treeview.close(action.params.branch);
  };
  
  lap.ontreeviewselectnode = function(action) {
    var treeview = this.dispatch(action.treeview);
    var node = this.dispatch(action.node);
    
    treeview.selectNode(node);
  };
  
  lap.ontreeviewremovenode = function(action) {
    var treeview = action.treeview;
    treeview = this.dispatch(treeview);
    
    var node = this.dispatch(action.node);
    treeview.removeNode(node);
  };
  
  lap.ontreeviewgetselection = function(action) {
    var treeview = this.dispatch(action.element);
    return treeview.getSelection();
  };
  

  // treeview
  //  factory
  ef.treeview = function(kwds, docmill, parent) {
    var div = tag('div', {id: kwds.id});

//     var labeldiv = tag('div'); labeldiv.addClass('luban-treeview-label');
//     div.append(labeldiv);
//     if (kwds.label) labeldiv.text(kwds.label);

//     var onclick = kwds.onclick;
//     if (onclick) {
//       div.click(function() {
// 	  luban.docmill.compile(onclick); 
// 	  return false;
// 	});
//     }
    
    var ul = tag('ul');  div.append(ul);
    ul.addClass('luban-treeview-container');

    var onnodemoving = kwds.onnodemoving;
    if (onnodemoving) {
      var f = function(node, refnode, type, tree) {
	var data =  {
	  "node": $(node).attr('id'),
	  "refnode": $(refnode).attr('id'),
	  "position-type": type
	};
	div.data('nodemoving-data', data);
	
	docmill.compile(onnodemoving); 

	return false;
      };
      div.data('onnodemoving-func', f);
    }

    //var ul = tag('ul', {id: kwds.id});
    //ul.addClass('filetree');
    //return ul.lubanElement('treeview');
    var ret = div.lubanElement('treeview');
    if (parent) {parent.add(ret);}
    return ret;
  };
  //  object
  widgets.treeview = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  // self check
  widgets.treeview.selfcheck = function() {
    return $.tree == null;
  };
  widgets.treeview.prototype = new widgets.base ();
  widgets.treeview.prototype.destroy = function() {
    var je = this._je;
    var id = je.attr('id');
    var ref = $.tree.reference(id);
    ref.destroy();
    je.remove();
  };
  widgets.treeview.prototype.add = function(subelem) {
    var div = this._je;
    var ul = div.find('.luban-treeview-container');
    ul.append(subelem._je);
  };
  // set the root node
  // root: a luban TreeViewBranch instance
  widgets.treeview.prototype.setRoot = function(root) {
    var div = this._je;
    var ul = div.find('.luban-treeview-container');
    var lis = ul.children('li');
    if (lis.length>0) 
      {throw "there is already a root";}
    ul.append(root._je);
  };
  widgets.treeview.prototype.removeNode = function(node) {
    var ref = this._jstreeRef();
    
    if (node) {
      ref.remove(node._je);
    } else {
      ref.remove();
    }

    ref.refresh();
  };
  widgets.treeview.prototype.getSelection = function(node) {
    var ref = this._jstreeRef();
    var selected = ref.selected;
    var ret = selected.lubanElement();
    return ret;
  };    
  widgets.treeview.prototype.closeAll = function() {
    var je = this._je;
    var id = je.attr('id');
    var ref = $.tree.reference(id);
    ref.close_all();
  };
  widgets.treeview.prototype.openBranch = function(branch) {
    var je = this._je;
    var id = je.attr('id');
    var ref = $.tree.reference(id);
    ref.open_branch(branch._je);
  };
  widgets.treeview.prototype.closeBranch = function(branch) {
    var je = this._je;
    var id = je.attr('id');
    var ref = $.tree.reference(id);
    ref.close_branch(branch._je);
  };
  widgets.treeview.prototype.selectNode = function(node) {
    var je = this._je;
    var id = je.attr('id');
    var ref = $.tree.reference(id);
    ref.select_branch(node._je);
  };
  widgets.treeview.prototype.addNode = function(referencenode, newnode, position) {
    var treeje = this._je;
    var ref = this._jstreeRef();
    var obj = {
      'attributes': {id: newnode.id},
      'data': {title: newnode.label},
      'state': 'open',
      'children': []
    };
    var refnode = referencenode._je;
    ref.create(obj, refnode);
    ref.refresh();
    
    var li = $('#'+newnode.id);
    
    var onclick = newnode.onclick;
    if (onclick != null && onclick != '') {
      var key = li.attr('id')+'-onclick-callback';
      var f = function() {luban.docmill.compile(onclick); return true;};
      treeje.data(key, f);
    }
    return li.lubanElement(newnode.type);
  };
  // implementation
  widgets.treeview.prototype._jstreeRef = function() {
    var je = this._je;
    var id = je.attr('id');
    return $.tree.reference(id);
  };

  // treeviewbranch
  //  factory
  ef.treeviewbranch = function(kwds, docmill, parent) {
    var li = tag('li', {id: kwds.id});
    // this is a hack to make sure every li has a reference to the tree container
    // jsTree 0.9.9 brutally remove all data and events associated with li so we have to
    // do this.
    var parentje = parent._je;
    var treeje = parentje.data('treeje');
    li.data('treeje', treeje);

    var akwds = {};
    var icon = kwds.icon;
    if (icon != null && icon != '') {
      var iconpath = luban.iconpath(icon);
      akwds.style = 'background-image:url("'+iconpath+'");';
    }
    var a = tag("a", akwds); li.append(a);
    a.text(kwds.label);
    
    var ul = tag('ul'); ul.addClass('luban-treeviewbranch-interior-container');
    li.append(ul);
    
    var onclick = kwds.onclick;
    if (onclick != null && onclick != '') {
      var key = li.attr('id')+'-onclick-callback';
      var f = function() {docmill.compile(onclick); return true;};
      treeje.data(key, f);
    }

    var ret = li.lubanElement('treeviewbranch');
    if (parent) {parent.add(ret);}
    return ret;
  };
  //  object
  widgets.treeviewbranch = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.treeviewbranch.prototype = new widgets.base ();
  widgets.treeviewbranch.prototype.add = function(subelem) {
    var ul = this._je.children('ul.luban-treeviewbranch-interior-container');
    ul.append(subelem._je);
  };


  // treeviewleaf
  //  factory
  ef.treeviewleaf = function(kwds, docmill, parent) {
    var li = tag('li', {id: kwds.id});
    // this is a hack to make sure every li has a reference to the tree container
    // jsTree 0.9.9 brutally remove all data and events associated with li so we have to
    // do this.
    var parentje = parent._je;
    var treeje = parentje.data('treeje');
    li.data('treeje', treeje);

    var akwds = {};
    var icon = kwds.icon;
    if (icon != null && icon != '') {
      var iconpath = luban.iconpath(icon);
      akwds.style = 'background-image:url("'+iconpath+'");';
    }
    var a = tag("a", akwds); li.append(a);
    a.text(kwds.label);

    var ret = li.lubanElement('treeviewleaf');
    if (parent) {parent.add(ret);}

    var onclick = kwds.onclick;
    if (onclick != null && onclick != '') {
      var key = li.attr('id')+'-onclick-callback';
      var f = function() {docmill.compile(onclick); return true;};
      treeje.data(key, f);
    }
    return ret;
  };
  //  object
  widgets.treeviewleaf = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.treeviewleaf.prototype = new widgets.base ();

 })(luban, jQuery);


// End of file
