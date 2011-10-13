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


// documentmill and actioncompiler needs to call preloader to load things
// from server.
// documentmill need to make sure all implementation javascripts of document
// types are loaded.
// aciton compiler need to make sure that load, submit, etc actions are loaded first.
//

(function(luban, $) {

  luban.compiler_preloader = function (actioncompiler) {
    this.actioncompiler=actioncompiler;
    this.loadingaction_compiler = new luban.loadingaction_compiler();
  };

  luban.compiler_preloader.prototype = {
    
    'findThingsToLoad': function(doc) {
      var doctypes = this.findDocTypesToLoad(doc);
      var loading_actions = this.findLoadingActions(doc);
      if (doctypes.length || loading_actions.length) {
	return {
	  'doctypes': doctypes,
	    'loading_actions': loading_actions
	    };
      }
      return;
    },

    'load': function (things, callback) {
      var doctypes = things.doctypes;
      var loading_actions = things.loading_actions;
      if (loading_actions.length && doctypes.length) {
	var self = this;
	var f = function() {self.performLoadingActions(loading_actions, callback);};
	this.loadDocTypeImplementations(doctypes, f);
      }
      if (loading_actions.length) {this.performLoadingActions(loading_actions, callback);}
      if (doctypes.length) {this.loadDocTypeImplementations(doctypes, callback);}
    },
    
    'findDocTypesToLoad': function(element) {
      if (typeof(element) != 'object' || element==null) {return [];}
      if (element.lubanaction) {return this.findDocTypesToLoadInAction(element);}
      if (element.lubanelement) // a doc element
	{return this.findDocTypesToLoadInDoc(element);}
      return [];
    },

    'findLoadingActions': function(element) {
      if (!element.lubanelement) {return [];}
      return _getLoadingActions(element).reverse();
    },

    'performLoadingActions': function(loading_actions, callback) {
      var compiler = this._getLoadingActionCompiler();
      var cmds = [];
      for (var i=0; i<loading_actions.length-1; i++) {
	var t = loading_actions[i];
	var action=t[0], parentdoc=t[1], key=t[2];
	var cmd = compileCmd(compiler, action, parentdoc, key);
	cmds.push(cmd);
      }
      var lastaction = loading_actions[loading_actions.length-1];
      var lastcmd = lastCompileCmd(compiler, lastaction[0], lastaction[1], lastaction[2], callback);
      cmds.push(lastcmd);

      luban.utils.runCmds(cmds);
    },

    'loadDocTypeImplementations': function(types, callback) {
      var f1 = function () {setTimeout(callback, 100);}; // wait for css to load
      luban.widgets.loadWidgetsImplementation(types, f1);
    },

    'findDocTypesToLoadInAction': function(action) {
      var r=[];
      for (var k in action) {
	var t = this.findDocTypesToLoad(action[k]);
	if (t) {r = r.concat(t);}
      }
      return r;
    },

    'findDocTypesToLoadInDoc': function(doc) {
      // all document types
      var types = _getTypes(doc);
      // find the types that were not yet loaded
      var toload = [];
      for (var i in types) {
	var type = types[i];
	var handler = 'on'+type;
	if (!luban.documentmill.prototype.hasOwnProperty(handler)) {
	  toload.push(type);
	}
      }
      return toload;
    },

    '_getLoadingActionCompiler': function() {
      var c = this.loadingaction_compiler;
      if (!c.actioncompiler) {c.actioncompiler = this.actioncompiler;}
      return c;
    }

  };

  function compileCmd(compiler, action, parentdoc, key) {
    function cmd(callback) {
      compiler.compile(action, parentdoc, key, callback);
    }
    return cmd;
  }
  function lastCompileCmd(compiler, action, parentdoc, key, callback) {
    function cmd() {
      compiler.compile(action, parentdoc, key, callback);
    }
    return cmd;
  }

  var assignLoadedData = function(host, key, callback) {
    var f = function (data, textStatus) {
      host[key] = data;
      callback();
    };
    return f;
  };

  // compiler for loading action
  luban.loadingaction_compiler = function (actioncompiler) {
    this.actioncompiler = actioncompiler;
  };

  luban.loadingaction_compiler.prototype = {

    'compile': function(action, parentdoc, key, callback) {
      if (!parentdoc) {
	var c = callback, self=this;
	parentdoc = {'t': null}; key = 't';
	callback = function () {
	  var loaded = parentdoc[key];
	  c(loaded);
	};
      }
      var type = action.type;
      var f = assignLoadedData(parentdoc, key, callback);
      var code = 'this.on'+type+'(action, f)';
      eval(code);
    },

    'onloading': function(action, callback) {
      var kwds = {
	'actor': action.actor,
	'routine': action.routine,
	'data': this._compileparams(action.params)
      };
      
      var C = luban.Controller;
      C.load(kwds, callback);
    },

    'onsubmission': function(action, callback) {
      var form = action.form;
      form = this.actioncompiler.dispatch(form);
      
      var kwds = {
	'actor': action.actor,
	'routine': action.routine,
	'data': this._compileparams(action.params)
      };

      form.clearErrors();

      var C = luban.Controller; C.submit(form._je, kwds, callback);
    },

    'onnotification': function(action, callback) {
      var element = this.actioncompiler.dispatch(action.element);
      var event = action.event;
      var kwds = {
	'actor': action.actor,
	'routine': action.routine,
	'data': this._compileparams(action.params)
      };
      
      var C = luban.Controller;
      C.notify(element, event, kwds, callback);
    },

    '_compileparams': function(args) {
      return this.actioncompiler._compileparams(args);
    }

  };


  // helpers
  // get all document types in a doc
  function _getTypes(doc, ret) {
    if (!ret) {ret = [];}
    if (doc.type && $.inArray(doc.type, ret)==-1) {ret.push(doc.type);}
    var c = doc.contents;
    if (c==null ||c.length==0) 
      {return ret;}
    for (var i in c) {
      var t = c[i];
      _getTypes(t, ret);
    }
    return ret;
  }

  // get all loading actions
  var loading_action_types = ['loading', 'notification', 'submission'];
			      
  // find actions that are loading actions
  // return a list
  // each element is a list of [action, context, name_of_action_in_context]
  function _getLoadingActions(doc, ret, parentdoc, key) {
    if (typeof(doc)!='object' || doc == null) {return;}
    if (!ret) {ret = [];}
    if (doc.lubanaction && 
	$.inArray(doc.type, loading_action_types)!=-1 &&
	$.inArray(doc, ret)==-1)
      {ret.push([doc, parentdoc, key]);}

    for (var k in doc) {
      // reserved words
      if (k == 'type' || k=='lubanelement' || k == 'lubanaction') {continue;}
      // on<> are event handlers, should not load things there
      // this also means other attributes cannot use 'on' as the first two characters.
      // probably should find a better way to do this (for example tagging 
      // event handlers with "lubaneventhandler"
      if (k.slice(0,2) == 'on') {continue;}
      
      var t = doc[k];
      _getLoadingActions(t, ret, doc, k);
    }
    return ret;
  }

 })(luban, jQuery);



// End of file
