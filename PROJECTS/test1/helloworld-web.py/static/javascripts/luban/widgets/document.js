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

  // declare temp local helper funcs
  var createSkeleton;

  // aliases
  var ef = luban.elementFactory;
  var widgets = luban.widgets;
  var tag = luban.utils.tag;

  
  // documentmill handler
  var dmp = luban.documentmill.prototype;
  dmp.ondocument = dmp._onContainer;


  // document
  ef.document = function (kwds, docmill, parent) {
    var id = kwds.id;
    
    // create the overall container
    var div = tag('div', {'id': id});

    //
    var lubanelem = div.lubanElement('document');
    if (parent) { parent.add(lubanelem); }
    
    return createSkeleton(kwds, docmill, parent, div);
  };

  // this is basically the factory of luban document,
  // it creates the title section and body section of the document
  // given the container div.
  createSkeleton = function(kwds, docmill, parent, div) {
    var ret = div.lubanElement('document');
    
    var Class = kwds.Class;

    // keep the args that create this document. maybe should make this universal
    ret._setCtorArgs(kwds);
    
    // 
    div.addClass(Class);
    div.addClass('luban-document');

    // deal with different settings
    if (kwds.collapsable) { div.addClass('collapsable'); }
    if (kwds.dockable && !kwds.collapsable) {
      ret._makeMeFloat(parent);
    }
    if (kwds.collapsable ||kwds.dockable || kwds.closable) 
      {div.addClass('panel');} // means the doc has a title bar and a border

    // now create me
    // title
    var title = ret._createTitle(kwds);
    div.append(title);

    // body
    var body = ret._createBody(kwds);
    div.append(body);

    // events
    var onclick = kwds.onclick;
    if (onclick) 
      {ret.jqueryelem.click( function() { docmill.compile(onclick); return false; } );}

    div.click(function (evt){
	// workaround for handling the form submission event.
	var target=evt.target;
	if (target != this) {return;}
	return $(this).lubanElement()._emphasizeMeAmongPeers();
      });

    
    var onexpand = kwds.onexpand;
    if (onexpand) {
      ret.jqueryelem.data('onexpand', onexpand);
    }
    var oncollapse = kwds.oncollapse;
    if (oncollapse) {
      ret.jqueryelem.data('oncollapse', oncollapse);
    }
    // initial state: collapsed or not?
    var collapsed = kwds.collapsed;
    if (collapsed) {ret._hideBody();}
    else {ret._showBody();}
    
    //
    return ret;
  };

  widgets.document = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.document.prototype = new widgets.base ();
  widgets.document.prototype.title_class = 'luban-document-title';  
  widgets.document.prototype.title_text_class = 'luban-document-title-text';
  widgets.document.prototype.body_class = 'luban-document-body';
  widgets.document.prototype.getTitleText = function() {
    return this._getTitleTextContainer().text();
  };
  widgets.document.prototype.add = function (subelem) {
    var t;
    if (typeof(subelem) == 'string') {
      t = subelem;
    } else {
      t = subelem.jqueryelem;
    }
    var body = this._getBody();
    body.append(t);
    
    if (this._isCollapsed()) { t.hide(); }
  };
  widgets.document.prototype.empty = function() {
    this.broadcastEvent('destroy');
    this._getBody().empty();
  };
  widgets.document.prototype.setAttribute = function(attrs) {
    var div = this._je;
    var ctorargs = this._getCtorArgs();
    
    // these properties change the way document behave, so 
    // we need to deal with them first.
    var collapsable = attrs.collapsable;
    var dockable = attrs.dockable;
    var closable = attrs.closable;
    if (collapsable!=null && collapsable!=ctorargs.collapsable ||
	dockable!=null && dockable!=ctorargs.dockable ||
	closable!=null && closable!=ctorargs.closable) {
      
      if (dockable) {
	// if dockable change from false to true, we need to remember where the 
	// document is from (its parent), so that later we can restore it to the
	// right place
	var info = luban.utils.getPositionalInfo(div);
	div.data("where-I-was-when-I-was-undockable", info);
      }
      // save the content
      var content = this._getBody().children();
      // my parent
      var parent = this.getParent();
      // remove interior of container div
      div.empty();
      // clean up other aspects of the container div
      div.removeClass(); div.unbind();
      // create a new skeleton
      if (collapsable!=null) 
	{ ctorargs.collapsable = collapsable; }
      if (dockable!=null)
	{ ctorargs.dockable = dockable; }
      if (closable!=null)
	{ ctorargs.closable = closable; }
      var newdoc = createSkeleton(ctorargs, luban.docmill, parent, div);
      // reestablish the content
      newdoc._getBody().append(content);
      //
      if (dockable == false) {
	// if dockable change from true to false, we need to put this document
	// back to its original place whenever possible
	var info2 = div.data("where-I-was-when-I-was-undockable");
	luban.utils.restorePosition(div, info2);
      }
    }

    // title
    var title = attrs.title;
    if (title!=null) {
      var titlecontainer = this._getTitleTextContainer();
      if (title) {
	titlecontainer.text(title).show();
      } else {
	titlecontainer.text(title).hide();
      }
      // make sure saved ctor args is up to date
      this._getCtorArgs().title = title;
    }

    // Class
    var Class = attrs.Class;
    if (Class) {
      div.removeClass();
      div.addClass(Class);
    }

    // collapsed
    var collapsed = attrs.collapsed;
    if (collapsed != null) {
      if (collapsed) {this.collapse();}
      else {this.expand();}
    }
  };
  // show my self
  widgets.document.prototype.show = function(callback) {
    this._putmeontop();
    this._je.show(callback);
    /*
    var doc = this;
    var f = function () {
      doc._je.css('height', '');
    };
    this._je.show(callback(f));
    */
  };
  // collapse: hide my body and call oncollapse
  widgets.document.prototype.collapse = function () {
    var ctorargs = this._getCtorArgs();
    if (!ctorargs.collapsable)  {
      alert("this document is not collapsable!");
      return;
    }
    this._hideBody();
    var oncollapse = this.jqueryelem.data('oncollapse');
    if (oncollapse) {
      luban.docmill.compile(oncollapse);
    }
  };
  // expand: show my body and call onexpand
  widgets.document.prototype.expand = function () {
    var doc = this;
    this._showBody();
    var onexpand = this.jqueryelem.data('onexpand');
    if (onexpand) {
      luban.docmill.compile(onexpand);
    }
  };

  // private methods
  widgets.document.prototype._isCollapsable = function () {
    return this._je.hasClass('collapsable');
  };
  widgets.document.prototype._isPanel = function () {
    return this._je.hasClass('panel');
  };
  widgets.document.prototype._isDockable = function () {
    return this._je.hasClass('dockable');
  };
  widgets.document.prototype._createBody = function(opts) {
    var div = tag('div');
    div.addClass(this.body_class);
    return div;
  };
  widgets.document.prototype._getBody = function () {
    return this._je.children('.'+this.body_class);
  };
  widgets.document.prototype._createTitle = function(opts) {
    // h1
    var h1 = tag('h1');
    var title = opts.title;
    if (title) {
      h1.text(title);
    } else {
      h1.hide();
    }
    h1.addClass(this.title_text_class);

    // if collapsable, need a table
    var collapsable = opts.collapsable, titlediv;
    var dockable = opts.dockable;
    var closable = opts.closable;
    if (collapsable || dockable || closable) {
      titlediv = tag('div');
      var table = tag('table'); titlediv.append(table);
      var row = tag('tr'); table.append(row);

      var leftcontrolcell = tag('td', {}); row.append(leftcontrolcell);
      leftcontrolcell.addClass('luban-document-title-controls');
      leftcontrolcell.addClass('left');
      this._createLeftControls(leftcontrolcell, opts);
      
      var titlecell = tag('td'); row.append(titlecell);
      titlecell.append(h1); 

      var rightcontrolcell = tag('td', {}); row.append(rightcontrolcell);
      rightcontrolcell.addClass('luban-document-title-controls');
      rightcontrolcell.addClass('right');
      this._createRightControls(rightcontrolcell, opts);

    } else {
      titlediv = h1;
    }
    titlediv.addClass(this.title_class);

    return titlediv;
  };
  // get container of controls at the left of the title
  widgets.document.prototype._getLeftControlsContainer = function() {
    var tsec = this._getTitleSection();
    return tsec.find('.luban-document-title-controls.left');
  };
  // get container of controls at the right of the title
  widgets.document.prototype._getRightControlsContainer = function() {
    var tsec = this._getTitleSection();
    return tsec.find('.luban-document-title-controls.right');
  };
  // create controls at the left of the title
  widgets.document.prototype._createLeftControls = function(container, opts) {
    var ctrls = this._createControls(opts);
    for (var i=0; i<ctrls.length; i++) {
      container.append(ctrls[i]);
    }
  };
  // create controls at the right of the title
  widgets.document.prototype._createRightControls = function(container, opts) {
    var ctrls = this._createControls(opts);
    for (var i=0; i<ctrls.length; i++) {
      container.append(ctrls[i]);
    }
  };
  // put this document on top of other documents
  widgets.document.prototype._putmeontop = function () {
    var zindex = 1111;
    
    // remove z-index of other dockables
    var dockables = $('.luban-document.dockable');
    for (var i=0; i<dockables.length; i++) {
      var d=$(dockables[i]);
      if (d.css('z-index') == zindex) {
	d.css('z-index','');
	d.removeClass('highlighted');
      }
    }
    // set my z-index
    this._je.css('z-index', zindex);
    this._je.addClass('highlighted');
  };
  // highlight this document
  widgets.document.prototype._highlightme = function () {
    // dehighlight others
    var notdockablepanels = $('.luban-document.panel:not(.dockable)');
    for (var i=0; i<notdockablepanels.length; i++) {
      var d=$(notdockablepanels[i]);
      if (d.hasClass('highlighted')) {
	d.removeClass('highlighted');
      }
    }
    // highlight me
    this._je.addClass('highlighted');
  };
  widgets.document.prototype._emphasizeMeAmongPeers = function () {
    // if this is not a panel, nothing to do
    if (!this._isPanel()) { return; }
    // if is dockable, put me on top, otherwise, just highlight me
    if (this._isDockable()) {
      this._putmeontop();
    }
    else {
      this._highlightme();
      return false;
    }
  };
  widgets.document.prototype._getTitleSection = function () {
    return this._je.children('.'+this.title_class);
  };
  widgets.document.prototype._getTitleTextContainer = function () {
    var s = this._getTitleSection();
    if (this._isPanel())
      { return s.find('.'+this.title_text_class); }
    return s;
  };
  // hide my body, no event fired 
  widgets.document.prototype._hideBody = function () {
    this._je.css('height', 'auto');
    var body = this._getBody();
    var doc = this._je;
    body.children().hide('normal');
    this._je.attr('collapsed', 1);
    this._setCollapseCtrlStatus(1);
  };
  // show my body, no event fired
  widgets.document.prototype._showBody = function (callback) {
    var body = this._getBody();
    this._je.attr('collapsed', '');
    this._setCollapseCtrlStatus(0);
    body.children().show('normal', callback); 
  };
  // get my status: expand or collapse
  widgets.document.prototype._isCollapsed = function() {
    return this._je.attr('collapsed');
  };
  // get my collapse control
  widgets.document.prototype._getCollapseCtrl = function () {
    return this._getTitleSection().find('.collapse-expand');
  };
  // change my collapse control to reflect the status of the document: collapsed or expanded
  widgets.document.prototype._setCollapseCtrlStatus = function (collapsed) {
    var t;
    if (collapsed) { t = 'v'; }
    else { t = '^'; }
    this._getCollapseCtrl().text(t);
  };
  // change this document to a float
  widgets.document.prototype._changeToFloat = function () {
    if (this._isCollapsed()) {
      alert('please expand this panel before make it float');
      return;
    }
    var div = this._je;
    // change the controls
//     var opts = div.data('luban-element-ctor-args');
//     if (!opts.collapsable) throw "this document is not collapsable, should not reach here";
//     opts.collapsable = false;
//     // left
//     var leftctrlscontainer = this._getLeftControlsContainer();
//     leftctrlscontainer.empty();
//     this._createLeftControls(leftctrlscontainer, opts);
//     // right
//     var rightctrlscontainer = this._getRightControlsContainer();
//     rightctrlscontainer.empty();
//     this._createRightControls(rightctrlscontainer, opts);
    // change the whote title section
    // remove the old one
    var titlediv = this._getTitleSection();
    titlediv.remove();
    // create new title and insert
    var opts = this._getCtorArgs();
    if (!opts.collapsable) {throw "this document is not collapsable, should not reach here";}
    opts.collapsable = false;
    var newtitlediv = this._createTitle(opts);
    this._getBody().before(newtitlediv);

    // make the document float
    this._makeMeFloat();
  };
  // make this document float: 
  //  1. attach me to a global document so I will not be destroyed by accident
  //  2. change my class
  //  3. make me draggable and resizable
  widgets.document.prototype._makeMeFloat = function(parent) {
    var div = this._je;
    // my original parent
    if (parent==undefined || ! parent)
      { parent = this.getParent(); }
    parent = parent._je;
    // global doc
    var globaldoc = $('.luban-frame');
    // if my parent is not the global document, move
    if (globaldoc.attr('id') != parent.attr('id')) {
      // move
      globaldoc.append(div);
      parent.find('#'+div.attr('id')).remove();
    }
    
    //
    div.addClass('dockable');
    div.draggable('destroy');
    div.draggable();
    div.resizable('destroy');
    div.resizable();
  };
  // create controls
  widgets.document.prototype._createControls = function (opts) {
    var widget = this;
    var ctrls = [];
    if (opts.collapsable)
      { ctrls.push(this._createCollapseControls()); }

    if (opts.dockable && opts.collapsable) {
      // this actually means we the document is initially a normal document that
      // can collapse, but has a control to make it "float". when the document
      // becomes a "float", it can be docked.
      // so here we create a ctrl to allow user to click it to make this document
      // a float
      var ctrl = tag('a'); ctrl.addClass('float'); ctrl.text('O');
      ctrl.click(function() {
	  widget._changeToFloat();
	});
      ctrls.push(ctrl);      
    } else if (opts.dockable) {
      // just dockable. we need a control to dock the float
      var ctrl2 = tag('a'); ctrl2.addClass('dock'); ctrl2.text('_');
      ctrl2.click(function() {
	  var dock = $('.luban-dock');
	  if (dock.length===0) {
	    alert("no dock is available");
	    return;
	  }
	  dock.lubanElement().attach(widget);
	});
      ctrls.push(ctrl2);
    }

    if (opts.closable) {
      var ctrl3 = tag('a'); ctrl3.addClass('close'); ctrl3.text('X');
      ctrl3.click(function() {
	  widget.destroy();
	});
      ctrls.push(ctrl3);
    }
    return ctrls;
  };
  // create controls for collapsing and expanding
  widgets.document.prototype._createCollapseControls = function () {
    var self = this;
    var ctrl = tag('a'); ctrl.addClass('collapse-expand');
    ctrl.click( function() {
	if (self._isCollapsed()) {self.expand();}
	else {self.collapse();}
      });
    return ctrl;
  };
  // ctor args
  widgets.document.prototype._getCtorArgs = function() {
    var div = this._je;
    return div.data('luban-element-ctor-args');
  };
  widgets.document.prototype._setCtorArgs = function(args) {
    var div = this._je;
    div.data('luban-element-ctor-args', args);
  };

 })(luban, jQuery);


// End of file
