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
  dmp.onprogressbar = dmp._onElement;


  // actioncompiler handler
  luban.actioncompiler.prototype.onprogressbarcancel = function(action) {
    var element = this.dispatch(action.element);
    element.cancel();
  };

  
  // progressbar
  //  factory
  ef.progressbar = function(kwds, docmill, parent) {
    var id = kwds.id;
    var div = tag('div', {"id": id}); div.addClass('luban-progressbar');

    var kls = kwds.Class;
    if (kls) {div.addClass(kls);}

    // periodically trigger a "checking" event
    var onchecking = kwds.onchecking;
    if (!onchecking) {throw "need to define onchecking handler";}

    var onfinished = kwds.onfinished;
    if (!onfinished) {throw 'need to define onfinished handler';}
    div.data('onfinished-callback', function() {docmill.compile(onfinished);});

    var oncanceled = kwds.oncanceled;
    if (oncanceled) {
      div.data('oncanceled-callback', function() {docmill.compile(oncanceled);});
    }
    var skip=kwds.skip;
    if (!skip) {skip = 500;}
    var interval = setCheckingTimer(onchecking, skip);
    div.data('checking-interval', interval); div.data('skip', skip);

    // interior: status text and progressbar
    var status = tag('div'); status.addClass('status');
    div.append(status);
    if (kwds.status) {status.text(kwds.status);}

    var pbar = tag('div'); pbar.addClass('pbar');
    div.append(pbar);
    pbar.progressbar();
    if (kwds.percentage) {pbar.progressbar('value', kwds.percentage);}

    var ret = div.lubanElement('progressbar');
    if (parent) {parent.add(ret);}
    return ret;
  };
  
  function setCheckingTimer(onchecking, skip) {
    var check = function () {luban.docmill.compile(onchecking);};
    return window.setInterval(check, skip);
  }

  //  object
  widgets.progressbar = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.progressbar.prototype = new widgets.base ();
  widgets.progressbar.prototype.setAttribute = function(attrs) {
    var je = this.jqueryelem;
    if (attrs.status) {
      var statusdiv = je.children('.status'); 
      statusdiv.text(attrs.status);
    }
    if (attrs.percentage) {
      var pbardiv = je.children('.pbar'); 
      pbardiv.progressbar('value', attrs.percentage);
      
      if (attrs.percentage>=100) {
	var interval = je.data('checking-interval');
	if (interval) {
	  clearInterval(interval); je.data('checking-interval', null);
	  var id = je.attr('id');
	  var f = function () {
	    var callback = je.data('onfinished-callback');
	    callback();
	  };
	  var skip = je.data('skip');
	  setTimeout(f, skip+200);
	}
      }
    }
  };
  widgets.progressbar.prototype.cancel = function(attrs) {
    var je = this.jqueryelem;
    clearInterval(je.data('checking-interval')); je.data('checking-interval', null);
    
    var f = je.data('oncanceled-callback');
    if (f) {f();}
  };


 })(luban, jQuery);


// End of file
