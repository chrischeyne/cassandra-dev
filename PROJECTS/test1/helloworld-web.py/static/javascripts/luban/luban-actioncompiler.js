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
//    * luban-controller.js


(function(luban, $) {

  // aliases
  var deepCopy = luban.utils.deepCopy;
  var isArray = luban.utils.isArray;


  luban.actioncompiler = function (docmill) {
    if (docmill == null) {docmill = new luban.documentmill();}
    this.docmill = docmill;
  };
  
  luban.actioncompiler.prototype = {
    
    'compile': function(actions) {
      // check if it is an action of a list
      if (isArray(actions)) {
	var ret = [];
	for (var i in actions) {
	  var action = actions[i];
	  ret.push(this.compile1(action));
	}
	return ret;
      } else {
	return this.compile1(actions);
      }
    },

    'compile1': function (action) {
      if (action==null) {return;}
      if (!action.type) {
	// if action does not have a "type" attribute,
	// we assume that it is not a luban action, but a normal value (str, number, etc)
	return action;
      }
      // 
      action = deepCopy(action);
      var toload = this.preloader.findThingsToLoad(action);
      if (toload) {
	var self = this;
	var loading_actions = toload.loading_actions;
	var runloaded = false;
	if (loading_actions && loading_actions.length)
	  { runloaded = loading_actions[loading_actions.length-1][0] == action; }
	var callback = function (loaded) {
	  if (runloaded) {
	    self.compile(loaded);
	  } else {
	    self.compile1(action);
	  }
	};
	this.preloader.load(toload, callback);
      } else {
	return this.dispatch(action);
      }
    },

    'dispatch': function (action) {
      var type = action.type;
      var code = 'this.on'+type+"(action)";
      return eval(code);
    },

    'onselectbyid': function(action) {
      var id = action.id;
      if (!id) {
        // assume that no id means the frame
        return $('div.luban-frame').lubanElement();
      }
      var je = $('#'+id);
      if (je.length === 0) {
	throw "not such element: id="+id;
      }
      return je.lubanElement();
    },

    'onreplacecontent': function(action) {
      var e = action.element;
      var element = this.dispatch(e);
      element.empty();
      
      var newdoc = action.newcontent;
      this.docmill.render(newdoc, element);

      element.jqueryelem.trigger('resize');
    },

    'oninsertbeforeelement': function(action) {
      var e = action.element;
      var element = this.dispatch(e);
      
      var parent = element.getParent();

      var newdoc = action.newelement;
      var newelementrendered = this.docmill.render(newdoc, parent);
      
      newelementrendered._je.insertBefore(element._je);

      element.jqueryelem.trigger('resize');
    },

    'onreplaceelement': function(action) {
      var e = action.element;
      var element = this.dispatch(e);
      var newdoc = action.newelement;

      // if element is the root (frame), special treatment is needed
      if (element.type() === 'frame')
	return element.replaceBy(newdoc, this.docmill);
      
      var parent = element.getParent();

      var newelementrendered = this.docmill.render(newdoc, parent);
      
      newelementrendered._je.insertBefore(element._je);
      element.destroy();
    },

    'onremovecontent': function(action) {
      var e = action.element;
      var element = this.dispatch(e);
      element.empty();
    },

    'onappendelement': function(action) {
      var container = this.dispatch(action.container);
      this.docmill.render(action.element, container);
    },

    'onsimpleaction': function(action) {
      var name = action.actionname;
      var method = 'on'+name.toLowerCase();
      return eval('this.'+method+'(action.params)');
    },

    'onsimpleelementaction': function(action) {
      var element = action.element;
      element = this.dispatch(element);
      switch(action.actionname) {
	
      case 'find':
	return element.find(action.params.name);

      case 'findDescendentIDs':
	return element.findDescendentIDs(action.params);

      case 'show':
	return element.show();
	
      case 'hide':
	return element.hide();
	
      case 'disable':
	return element.disable();
	
      case 'enable':
	return element.enable();

      case 'destroy':
	return element.destroy();

      case 'focus':
	return element.focus();

      case 'addClass':
	return element.addClass(action.params.Class);

      case 'removeClass':
	return element.removeClass(action.params.Class);

      case 'setAttribute': 
	return this.onsimpleelementaction_setAttribute(action);

      case 'getAttribute': 
	return element.getAttribute(action.params.name);

      default:
	var etype = element.type();
	var method = 'on'+etype+action.actionname;
	method = method.toLowerCase();
	return eval('this.'+method+'(action);');
      }
    },

    'onsimpleelementaction_setAttribute': function(action) {

      var element = action.element;
      element = this.dispatch(element);

      var params = this._compileparams(action.params);
      // set id
      var id = params.id;
      if (id!=null) {element.setID(id);}
	
      return element.setAttribute(params);
    },

    //
    'onalert': function(params) {
      params = this._compileparams(params);
      alert(params.message);
    },

    //  credential
    // createCredential
    'oncredentialcreation': function(params) {
      luban.Controller.createCredential(params);
    },

    // updateCredential
    'oncredentialupdate': function(params) {
      luban.Controller.updateCredential(params);
    },

    // remove credential
    'oncredentialremoval': function(action) {
      luban.Controller.removeCredential();
    },


    // helpers
    '_compileparams': function(params) {
      var ret = {};
      for (var key in params) {
	var value = params[key];
	value = this.compile1(value);
	if (value!=null) {ret[key] = value;}
      }
      return ret;
    }
  };

 })(luban, jQuery);


// End of file
