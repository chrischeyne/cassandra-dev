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
//   jquery, jquery ui


// namespace luban
luban = {  
  'elementFactory': {},
  'widgets': {},
  'configuration': {
    'images_base': '/images',
    'icons_base': '/images/icons'
  }
};


luban.utils = {};


(function (luban, $) {

  // this is necessary for avoiding problem in IE
  $.ajaxSetup({cache: false});


  function confirmBrowseAway()
  {
    return "!!! Please note that this site does not support browser's \"Back\" button !!!";
  }
  window.onbeforeunload = confirmBrowseAway;


  // declaration of helpers
  var _loadJSCmd;
  

  $.fn.lubanElement = function (type) {
    if (type == null) {
      type = this.attr('luban-element-type');
      if (type == null) {
	throw String(this) + ':' + $(this).attr('id') + ': ' + 'no element type';
      }
    } else {
      this.attr('luban-element-type', type);
    }
    var factory = luban.widgets[type];
    return new factory(this);
  };


  // widget base
  luban.widgets.base = function (elem) {
    this.jqueryelem = elem;
    this._je = this.jqueryelem;
  };
  luban.widgets.base.prototype = {
    'type': function () {
      return this.jqueryelem.attr('luban-element-type');
    },
    // find descendents by name
    'find': function (name) {
      return this.jqueryelem.find('[luban-element-name='+name+']').lubanElement();
    },
    // find descendents and return their ids
    'findDescendentIDs': function(params) {
      var type = params.type;
      var found = this.jqueryelem.find('[luban-element-type='+ type + ']');
      var ids = [];
      for (var i=0; i<found.length; i++) {
	ids.push($(found[i]).attr('id'));
      }
      return ids;
    },
    'show': function (callback) {
      return this.jqueryelem.show(callback);
    },
    'hide': function (callback) {
      return this.jqueryelem.hide(callback);
    },
    'disable': function () {
      this.jqueryelem.find('input').attr('disabled', 'disabled');
      this.jqueryelem.find('select').attr('disabled', 'disabled');
      this.jqueryelem.find('textarea').attr('disabled', 'disabled');
    },
    'enable': function () {
      this.jqueryelem.find('input').removeAttr('disabled');
      this.jqueryelem.find('select').removeAttr('disabled');
      this.jqueryelem.find('textarea').removeAttr('disabled');
    },
    'add': function (subelem) {
      if (typeof(subelem) == 'string') {
	this.jqueryelem.append(subelem);
      } else {
	this.jqueryelem.append(subelem.jqueryelem);
      }
    },
    'destroy': function() {
      this.broadcastEvent('destroy');
      this.jqueryelem.trigger('destroy');
      this.jqueryelem.remove();
    },
    'focus': function() {
      this.jqueryelem.focus();
    },
    'setAttribute': function(args) {
      throw 'widgets.base.setAttribute:' + this.type() + ' notimplementederror';
    },
    
    // retrieve data related to the specified event
    'getEventData': function (event) {
      return this.jqueryelem.data(event+'-data');
    },
    // save data related to the specified event
    'setEventData': function (event, data) {
      return this.jqueryelem.data(event+'-data', data);
    },

    // empty my content
    'empty': function (event) {
      this.broadcastEvent('destroy');
      this._je.empty();
      //throw 'widgets.base.empty:' + this.type() +' notimplementederror';
    },
    
    // broadcast event to all my descendents
    'broadcastEvent': function(event) {
      this._je.find('[luban-element-type]').trigger(event);
    },

    // addClass
    'addClass': function(Class) {
      this.jqueryelem.addClass(Class);
    },

    // removeClass
    'removeClass': function(Class) {
      if (this.jqueryelem.hasClass(Class)) {
	this.jqueryelem.removeClass(Class);
      }
    },

    // set id:
    'setID': function(id) {
      this.jqueryelem.attr('id', id);
    },

    // set tip
    'setTip': function(tip) {
      if (tip) {
	var je = this._je;
	// set attribute "title". this could conflict other use of "title" attribute
	je.attr('title', tip);
	je.tooltip({
	  showURL: false
        });
      }
    },

    'getParent': function() {
      return this.jqueryelem.data('luban-parent');
    },

    'setParent': function(parent) {
      this.jqueryelem.data('luban-parent', parent);
    }

  };


  luban.iconpath = function(filename) {
    return luban.configuration.icons_base+'/'+filename;
  };

  luban.imagepath = function(filename) {
    return luban.configuration.images_base+'/'+filename;
  };


  luban.utils.loadJS = function(script, callback) {
      try{
	  var selem = document.createElement("script");
	  selem.type = "text/javascript";
	  selem.src  = script;
	  selem.charset= "UTF-8";
	  if (selem.readyState){  //IE
	      selem.onreadystatechange = function(){
		  if (selem.readyState == "loaded" ||
		      selem.readyState == "complete"){
		      selem.onreadystatechange = null;
		      callback();
		  }
	      };
	  } else {  //Others
	      selem.onload = function(){
		  callback();
	      };
	  }
	  var head = document.getElementsByTagName("head");
	  head[0].appendChild(selem);
      }catch(e){
	  document.write("<script type='text/javascript' src='" + script + "' charset=\"UTF-8\"><"+"/script>");
      }
      //      var se = $('script[src="'+script+'"]');
      //se.load(callback);
  };
  
  luban.utils.loadCSS = function(css, media) {
      if(document.createStyleSheet) {
	  document.createStyleSheet(css);
      }
      else {
	  var newSS= document.createElement('link');
	  newSS.rel= 'stylesheet';
	  newSS.type= 'text/css';
	  newSS.media= media || "all";

	  newSS.href= css;
	  // var styles= "@import url(' " + url + " ');";
	  // newSS.href='data:text/css,'+escape(styles);
	  document.getElementsByTagName("head")[0].appendChild(newSS);

      }
  };

  //
  luban.utils.loadJavascripts = function(urls, callback) {
    var dmgr = new luban.utils.jsDownloadManager();
    for (var i=0; i<urls.length; i++) {
      var url=urls[i];
      dmgr.addDownload( {url:url} );
    }
    dmgr.start(callback);
  };
  
  //
  luban.utils.jsDownloadManager = function () {
    this.downloads = [];
    this.downloaded = [];
  };
  luban.utils.jsDownloadManager.prototype = {
    'setDownloads': function(downloads) {
      this.downloads = downloads;
    },
    'addDownload': function (download) {
      this.downloads.push(download);
    },
    'start': function(callback) {
      var cmds = [];
      for (var i in this.downloads) {
	var d = this.downloads[i];
	var cmd = _loadJSCmd(d);
	cmds.push(cmd);
      }
      cmds.push(callback);
      luban.utils.runCmds(cmds);
    }
  };
  
  _loadJSCmd = function (d) {
    function cmd(callback) {
      var url = d.url;
      var f = function () {
	if (d.check) {
	  if (d.check()) {
	    var s = "failed to load " + url;
	    throw s;
	  }
	}
	callback();
      };
      luban.utils.loadJS(url, f);
    }
    return cmd;
  };

  // run a sequence of commands
  // each command is a javascript function that has the signature
  // function command(callback)
  // callback will be called when command is done.
  function runCmds(cmds) {
    if (cmds.length==1) {return cmds[0]();}
    var todo = cmds.slice(1);
    var f = function() {runCmds(todo);};
    return cmds[0](f);
  }
  luban.utils.runCmds = runCmds;

  // misc
  // factory to create a new tag
  luban.utils.tag = function(name, kwds) {

    var assignments = [];
    
    for (var key in kwds) {
      var value = kwds[key];
      assignments.push( key + '=' + '"' + value + '"' );
    }
    
    var  s = "<" + name + ' ' + assignments.join(' ') + ">" + "</"+name+">";
    
    return $(s);
  };

  // debug log
  luban.utils.log = function(channel, msg) {
    try {
      // only works for firebug
      console.debug(channel+': '+msg);
    } catch (e) {
    }
  };
  
  // convert string to a boolean
  luban.utils.str2bool = function(s) {
    var v = s.toLowerCase();
    if (v=='on' || v=='yes' || v=='true') {return true;}
    v = Number(v);
    if (String(v)=='NaN') {return false;}
    return v !== 0;
  };

  // check if an object is an array
  luban.utils.isArray = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

  // deep copy an object.
  luban.utils.deepCopy = function(obj) {
    var out, i;
    if (luban.utils.isArray(obj)) {
      out = []; i = 0;
      var len = obj.length;
      for ( ; i < len; i++ ) {
	out[i] = arguments.callee(obj[i]);
      }
      return out;
    }
    if (obj && typeof obj === 'object') {
      out = {};
      for ( i in obj ) {
	out[i] = arguments.callee(obj[i]);
      }
      return out;
    }
    return obj;
  };

  // save the positional information of an element so we can restore it
  // to the same place.
  luban.utils.getPositionalInfo = function(elem) {
    var parent = elem.parent();
    var next = elem.next();
    return {parent:parent, next:next};
  };
  // restore an element to the saved position 
  luban.utils.restorePosition = function(elem, positionaliinfo) {
    var originalparent = positionaliinfo.parent;
    var originalnext = positionaliinfo.next;
    
    // current parent
    var parent = elem.parent();
    var next = elem.next();
    
    // if position has not changed, skip
    if (parent[0]==originalparent[0] && next[0]==originalnext[0]) {return;}
    
    if (originalnext) {
      originalnext.before(elem);
    } else {
      originalparent.append(elem);
    }
    parent.children('#'+elem.attr('id')).remove();
  };

 })(luban, jQuery);


// End of file
