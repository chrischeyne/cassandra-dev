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


// controller object
C = luban.Controller = {
  // the following two global parameters necessary for correct operations of luban
  'url': null, // controller's url: eg http://your.web.site/main.py
  'credential': {}, // credential dictionary
  'cookie_settings': {
    'use_cookie': false,
    'path': '/cgi-bin/', // path of cookie
    'expires': 1
  }
};


// extend jquery
(function ($, luban) {

  // aliases
  var ef = luban.elementFactory;
  var C  = luban.Controller;
  var widgets = luban.widgets;
  

  // helpers declaration
  var argsStr;

  
  // *** "widgets" ***
  //
  // credential
  ef.credential = function (kwds) {
    C.createCredential(kwds);
    // a invisible div
    var div = $('<div></div>').hide();
    return div.lubanElement('credential');
  };
  widgets.credential = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.credential.prototype = new widgets.base();
  
  
  // 
  C.createCredential = function (kwds) {
    C.credential = {username: kwds.username, ticket: kwds.ticket};
    
    // save credential to cookie as well
    var cookie_settings = C.cookie_settings;
    if (cookie_settings.use_cookie) {
      try {
	$.cookie('sentry.username', kwds.username, cookie_settings);
	$.cookie('sentry.ticket', kwds.ticket, cookie_settings);
      } catch (e) {
	// cookie error
      }
    }
  };
  //
  C.updateCredential = C.createCredential;
  C.removeCredential = function() {
    C.credential = {};
    var cookie_settings = C.cookie_settings;
    if (cookie_settings.use_cookie) {
      try {
	$.cookie('sentry.username', null, cookie_settings);
	$.cookie('sentry.ticket', null, cookie_settings);
      } catch (e) {
	// cookie error
      }
    }
  };
  // create the credentail data to be send to the server
  C.getCredentialArgs = function() {
    var credential = C.credential;
    var username, ticket;
    if (!credential || !credential.username) {
      // try cookie
      //   if cookie is forbidden, just quit
      if (!C.cookie_settings.use_cookie) {return {};}
      //
      try {
	username = $.cookie('sentry.username');
	ticket = $.cookie('sentry.ticket');
      } catch (e) {
	// no way to get cookie
      }
      if (!username || !ticket)
	{ return {}; }
      credential.username = username;
      credential.ticket = ticket;
    }

    var ret = {};
    username = credential.username;
    if (username) {ret['sentry.username'] = username;}
    
    ticket = credential.ticket;
    if (ticket) {ret['sentry.ticket'] = ticket;}

    return ret;
  };
    
  
  // method to submit form (this) to the given actor and routine
  // actor and routine are specified in kwds
  // kwds:
  //   actor: name of actor
  //   routine: name of routine
  //   callback: callback function when response from the server is obtained
  //   responsetype: type of response obtained from server. default: json
  //   data: additional data to send to the controller
  $.fn.submitTo = function(kwds) {
    var actor = kwds.actor;
    var routine = kwds.routine;
    if (!routine) {routine = 'default';}
    var callback = kwds.callback;
    var controller = C.url;

    var responsetype = kwds.responsetype;
    if (responsetype == null)
      {responsetype ='json';}

    var formdatastr = $(this).serialize();

    var data = kwds.data, datastr;
    if (data == null) {datastr = '';}
    else {datastr = argsStr(data);}

    var sentrystr = argsStr(C.getCredentialArgs());
    
    var args = {'actor': actor,
		'routine': routine};
    var allargsstr = [argsStr(args), sentrystr, datastr, formdatastr].join('&');

    // jquery ajax post
    $.post(controller, allargsstr, callback, responsetype);
    
    return $(this);
  };

  
  // replace the content of "this" widget
  // data: a dict
  //   html: new html content
  //   includes: paths of js scripts to include
  //   script: js script to run
  $.fn.replaceContent = function(data) {
    // clear
    $(this).empty();

    C.execUIUpdateInstructions(data);
  };


  // helper function
  // string of arguments in url
  luban.utils.argsStrInUrl = argsStr = function (args) {
    var assignments = [];
    for (var k in args) {
      var v = args[k];
      assignment = k+'='+v;
      assignments.push(assignment);
    }
    return assignments.join('&');
  };
  
  // prepend 'actor.' to keys
  function prependActorStr(args) {
    var d = {};
    for (var k in args) {
      var k1 = 'actor.'+k;
      d[k1] = String(args[k]);
    }
    return d;
  }
  C.prependActorStr = prependActorStr;


  // controller methods

  // call controller
  // kwds
  //   actor: the name of the actor
  //   routine: the name of the routine
  //   callback: the call back function when the response of the server is received
  //   responsetype: the expected response type. default: json
  //   data: the additional data to send to the server
  C.call = function (kwds) {
    var actor = kwds.actor;
    var routine = kwds.routine;
    if (!routine) {routine='default';}
    var callback = kwds.callback;
    var url = C.url;

    var responsetype = kwds.responsetype;
    if (responsetype==null)
      {responsetype = 'json';}

    // call
    var args = {'actor': actor,
		'routine': routine};

    // data
    var data = kwds.data;
    if (data == null) {data = {};}

    // credential
    var credArgs = C.getCredentialArgs();

    // all
    var allargs = $.extend({}, args, data, credArgs);

    var f = function(callback) {
      $.get(url, allargs, callback, responsetype);
    };
    // for debug
    f.url = url; f.allargs = allargs;
    
    C.runWithLoadingAlert(f, callback);
    
    return;
  };

  // run a function (which has a callback function when the function finishes)
  // with "loading ..." alert shown on the window
  C.runWithLoadingAlert = function (func, callback) {
    var callback1 = function () {
      // shut down the loading alert
      C.notifyLoadingDivToEnd(func);

      // start callback function
      callback.apply({}, arguments);
    };
    // start the loading alert
    C.notifyLoadingDivToStart(func);
    // call the function with new callback
    func(callback1);
    return;
  };

  C.notifyLoadingDivToStart = function (func) {

    var loadingdiv = C.getLoadingDiv();

    var f = function () {
	  
      // if this loading is already finished, this function won't be triggered
      
      // so, if we reach here, this means the loading is not yet finished,
      // we need to remove the stored timeout, because this timeout is happening
      delete loadingdiv.data('timeouts')[func];

      // and it is the latest loading event. should take over the "loading..."
      // alert if it is running.
      if (loadingdiv.data('running')) {
	loadingdiv.data('owner', func);
	return;
      }

      // this means the loading alert is not running. we need to get it running
      // first claim the owner ship of the loading alert
      loadingdiv.data('owner', func);
      
      // then start the alert
      C.startLoadingAlert();

      // hack
//       var f1 = function() {C.notifyLoadingDivToEnd(func)};
//       setTimeout(f1, 5000);
    };

    // this should only start after a moment after the user click
    var timeout = setTimeout(f, 700);
    // store this timeout so that we can cancel it if the loading finished before
    // the time runs out
    loadingdiv.data('timeouts')[func] = timeout;
  };

  C.notifyLoadingDivToEnd = function (func) {
    var loadingdiv = C.getLoadingDiv();

    // if this func is the owner of the loading alert, we should stop the alert
    var owner = loadingdiv.data('owner');
    if (owner==func) {
      C.stopLoadingAlert();
      return;
    }
    
    // otherwise, we should clear the timeout if it is there
    var timeouts = loadingdiv.data('timeouts');
    var timeout = timeouts[func];
    if (timeout) {clearTimeout(timeout);}
    delete timeouts[func];
  };
  C.startLoadingAlert = function() {
    var loadingdiv = C.getLoadingDiv();

    loadingdiv.data('running', 1);
    var wh=$(window).height(), ww=$(window).width();
    loadingdiv.css('left', ww/2-20);
    loadingdiv.css('top', wh/2);
    loadingdiv.show();
  };
  C.stopLoadingAlert = function() {
    var loadingdiv = C.getLoadingDiv();
    
    // hide the visual
    loadingdiv.hide();
    loadingdiv.data('running', 0);
    loadingdiv.data('owner', null);
  };

  C.getLoadingDiv = function () {
    var id = 'luban-----loadingdiv';
    var div = $('#'+id);

    // this should not happend
    if (div.length>1) {throw "?";}

    // if not found, creat it
    if (div.length===0) {

      // create the div
      div = $('<div id="'+id+'"/>');
      //div.text('loading...');
      div.hide();
      
      // attach to page
      $('body').append(div);

      //
      div.data('timeouts', {});
      div.data('owner', null);
      div.data('running', 0);
    }
    return div;
  };

  // given instructions to change user interface, execute them
  C.execUIUpdateInstructions = function(data, textStatus) {
    if (data.lubanaction || data['0'] ) // array means a list of actions
      {return luban.docmill.compile(data);}
    return luban.docmill.render(data);
  };

  // load from server and execute commands in the response
  // kwds: a dict
  //   actor: the name of the actor
  //   routine: the name of the routine
  //   data: a dictionary of additional parameters to send to the server
  C.load = function(kwds, callback) {
    kwds.callback = callback;
    var data = kwds.data;
    kwds.data = prependActorStr(data);
    C.call(kwds);
  };


  // notify the server the event happened to an element,
  // and execute commands in the response
  // element: the element where event happened
  // event: the name of the event
  // kwds: a dict
  //   actor: the name of the actor
  //   routine: the name of the routine
  //   data: a dictionary of additional parameters to send to the server
  C.notify = function(element, event, kwds, callback) {
    var evtdata = element.getEventData(event);
    var data = kwds.data;
    var tmp = $.extend({}, data, evtdata);
    tmp = prependActorStr(tmp);
    kwds.data = tmp;

    kwds.callback = callback;

    C.call(kwds);
  };


  // submit form to server and get response and execute commands in the response
  // form: the form to submit
  // kwds: a dict
  //   actor: the name of the actor
  //   routine: the name of the routine
  //   data: a dictionary of additional parameters to send to the server
  C.submit = function(form, kwds, callback) {
    kwds.callback = callback;
    kwds.data = prependActorStr(kwds.data);
    form.submitTo(kwds);
  };


 })(jQuery, luban);


// End of file
