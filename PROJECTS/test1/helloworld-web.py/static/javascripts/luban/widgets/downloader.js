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
  dmp.ondownloader = dmp._onElement;


  // downloader
  ef.downloader = function (kwds, docmill, parent) {
    var Class = kwds.Class;
    var id = kwds.id;
    var elem = tag('a', {'id': id, 'target': '_blank'});
    elem.text(kwds.label);

    var ret = elem.lubanElement('downloader');
    
    elem.addClass(Class);
    elem.addClass('luban-downloader');

    var ondownload = kwds.ondownload;
    if (ondownload.type != 'loading') {
	throw 'downloader.ondownload has to be a "load" action';
    }
    var actor = ondownload.actor; var routine = ondownload.routine; 
    var data = ondownload.params;
    var C = luban.Controller;
    var credArgs = C.getCredentialArgs();
    data = C.prependActorStr(data);
    var parameters = $.extend({}, {'actor':actor, 'routine':routine}, data, credArgs);
    url = luban.Controller.url + '?' + luban.utils.argsStrInUrl(parameters);

    elem.attr('href', url);

    if (parent) {parent.add(ret);}

    return ret;
  };

  widgets.downloader = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  // self check
  widgets.downloader.selfcheck = function() {
      // false means nothing wrong
    return false;
  };
  widgets.downloader.prototype = new widgets.base ();
  
})(luban, jQuery);


// End of file
