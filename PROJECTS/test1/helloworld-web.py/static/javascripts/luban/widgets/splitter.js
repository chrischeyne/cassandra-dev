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
  // declare helpers
  var format_orientation;

  // aliases
  var ef = luban.elementFactory;
  var widgets = luban.widgets;
  var tag = luban.utils.tag;

  
  // documentmill handler
  var dmp = luban.documentmill.prototype;
  dmp.onsplitter = dmp.onsplitsection = dmp._onContainer;
  
  
  // splitter
  //  factory
  ef.splitter = function(kwds, docmill, parent) {
    var orientation = format_orientation(kwds.orientation);
    var id = kwds.id;
    
    var container = tag('div', {"id": id});
    var kls = kwds.Class;
    if (kls) {container.addClass(kls);}

    //
    container.data('orientation', orientation);
    var ret = container.lubanElement('splitter');

    ret._createSectionsContainer(orientation);

    var onclick = kwds.onclick;
    if (onclick) {
      container.click( function() { docmill.compile(onclick); return false; } );
    }
    if (parent) {parent.add(ret);}
    return ret;
  };

  //  object
  widgets.splitter = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.splitter.prototype = new widgets.base ();
  widgets.splitter.prototype.add = function() {
    // not used. use createSection directly
  };
  widgets.splitter.prototype.setAttribute = function(attrs) {
    var o = format_orientation(attrs.orientation);
    if (o!=null) {
      var oldo = this._je.data('orientation');
      if (oldo==o) {return;}
      var sections_container = this._getSectionsContainer();
      var section_containers = sections_container.children();
      // sections
      var sections = section_containers.children();
      // ids
      var ids = [], f = function () {ids.push($(this).attr('id'));};
      section_containers.each(f);
      // empty the overall container
      sections_container.empty();
      // remove the overall container
      this._removeSectionsContainer(oldo);
      // reestablish
      this._createSectionsContainer(o);
      for (var i in ids) {
	var sec = this._createSectionContainer(ids[i], o);
	sec.append(sections[i]);
      }
      //
      this._je.data('orientation', o);
    }
  };
  widgets.splitter.prototype.createSection = function(kwds, docmill) {
    var id = kwds.id;
    var kls = kwds.Class;
    var onclick = kwds.onclick;

    var orientation = this._je.data('orientation');
    var section_container = this._createSectionContainer(id, orientation);
    
    var div = tag('div');
    div.addClass(widgets.splitsection.prototype.interior_container_class);
    section_container.append(div);
    
    if (kls) { section_container.addClass(kls); }

    if (onclick) {
      div.click( function() { docmill.compile(onclick); return false; } );
    }
    return section_container.lubanElement('splitsection');
  };
  // create the overall container of all sections
  // immediate children of this container are containers of sections
  widgets.splitter.prototype._createSectionsContainer = function(orientation) {
    // container is overall container created for splitter
    if (orientation == 'vertical') {
    } else {
      var container = this._je;
      var table = tag('table'); container.append(table);
      table.addClass('luban-splitter');
      var tbody = tag('tbody'); table.append(tbody);
      var tr = tag('tr'); tr.addClass('luban-splitter-section-container');
      tbody.append(tr);
    }
  };
  // remove the overall container of all sections
  widgets.splitter.prototype._removeSectionsContainer = function(orientation) {
    if (orientation == null) {orientation = this._je.data('orientation');}
    if (orientation == 'horizontal') {
      this._je.empty();
    }
  };
  // retrieve the overall container of all sections.
  // they are created by method _createSectionsContainer
  widgets.splitter.prototype._getSectionsContainer = function(orientation) {
    if (orientation==null) {orientation = this._je.data('orientation');}
    var section_container_class = 'luban-splitter-section-container';
    if (orientation == 'vertical') {
      return this._je;
    } else {
      var table = this._je.children('table');
      var tbody = table.children('tbody');
      return tbody.children('tr.'+section_container_class);
    }
  };
  // create container of a section. the type of this container element
  // depends on the orientation of the splitter.
  widgets.splitter.prototype._createSectionContainer = function(id, orientation) {
    var tagname, sec, sections_container=this._getSectionsContainer(orientation);
    
    if (orientation == 'vertical') {tagname = 'div';}
    else {tagname = 'td';}
    sec = tag(tagname, {'id': id});
    
    sections_container.append(sec);
    return sec;
  };

  // splitsection
  // factory
  ef.splitsection = function(kwds, docmill, splitter) {
    if (splitter.type()!='splitter') {throw "splitsection must be inside spplitter";}
    return splitter.createSection(kwds, docmill);
  };
  widgets.splitsection = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.splitsection.prototype = new widgets.base ();
  widgets.splitsection.prototype.interior_container_class = 'luban-splitsection-interior-container';
  // the implementation of splitsection is that it always has an "interior-container" div
  // so we need to make sure we are doing the right thing when adding or removing content
  widgets.splitsection.prototype.empty = function() {
    this.broadcastEvent('destroy');
    var c = this.jqueryelem.children('div.'+this.interior_container_class);
    c.empty();
  };
  widgets.splitsection.prototype.add = function(elem) {
    var c = this.jqueryelem.children('div.'+this.interior_container_class);
    c.append(elem.jqueryelem);
  };
  widgets.splitsection.prototype.addClass = function(Class) {
    var c = this.jqueryelem.children('div'+this.interior_container_class);
    c.addClass(Class);
  };
  widgets.splitsection.prototype.removeClass = function(Class) {
    var c = this.jqueryelem.children('div'+this.interior_container_class);
    if (c.hasClass(Class)) {
	c.removeClass(Class);
    }
  };

  format_orientation = function (orientation) {
    if (orientation=='vertical') {return orientation;}
    return 'horizontal';
  };

 })(luban, jQuery);


// End of file
