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
};


// extend jquery
(function ($, C) {

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
    var callback = kwds.callback;
    var controller = C.url;

    var responsetype = kwds.responsetype;
    if (responsetype == null)
      responsetype ='json';

    var formdatastr = $(this).serialize();

    var data = kwds.data, datastr;
    if (data == null) datastr = '';
    else datastr = argStr(data);

    var sentrystr = argStr(C.getCredentialArgs());
    
    var args = {'actor': actor,
		'routine': routine};
    var allargsstr = [argStr(args), sentrystr, datastr, formdatastr].join('&');

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

    // decompose data
    var html = data.html;
    var includes = data.includes;
    var script = data.script;

    // include scripts
    for (var index in includes) {
      var include = includes[index];
      $.getScript(include);
    };

    // html 
    $(this).html(html);

    // run script
    eval(script);
  };


  // append a new element to "this" widget
  // type: type of container element (this)
  //   Document, Tabs, TreeView, ...
  // newdoc: new document. a dictionary
  //   html: new html content
  //   includes: paths of js scripts to include
  //   script: js script to run
  // elementdata: a dictionary describing data for the new element
  $.fn.appendLubanSubElement = function(type, newdoc, elementdata) {
    // 
    var handler = $.fn.appendLubanSubElement['handle_'+type];
    if (handler == null)
      handler = $.fn.appendLubanSubElement.handle_default;
    
    return handler($(this), newdoc, elementdata);
  };


  // destroy a luban element
  $.fn.destroyLubanElement = function(type) {

    var handler = $.fn.destroyLubanElement['handle_'+type];
    if (handler == null)
      handler = $.fn.destroyLubanElement.handle_default;
    
    return handler($(this));    
  };


  // set rowChangedData of the table from the cell
  $.fn.setRowChangedDataFromCell = function(cell) {
    var table = $(this);
    var cell = $(cell);
    var row = cell.parent();
    
    var data = {};
    var row_identifying_cols = table.data('row-identifying-cols');
    for (var i in row_identifying_cols) {
      var colname = row_identifying_cols[i];
      var value = row.get_colvalue_from_row(colname);
      data[colname] = value;
    }
    data[cell.attr('colname')] = cell.extract_data_from_cell();

    table.data('rowChangedData', data);
  };


  // handlers

  // appendLubanSubElement handlers
  // these implementations are correlated to the implementations in weaver.web.DocumentMill
  
  //  default
  $.fn.appendLubanSubElement.handle_default = function (container, newdoc, elementdata) {

    html = newdoc.html;
    includes = newdoc.includes;
    script = newdoc.script;

    // include scripts
    for (var index in includes) {
      var include = includes[index];
      $.getScript(include);
    };

    // html 
    container.append(html);

    // run script
    eval(script);

    return container;
  };


  //  Tab
  $.fn.appendLubanSubElement.handle_Tab = function(container, newdoc, elementdata) {
    var label = elementdata.label;
    var id = elementdata.id;
    
    container.tabs('add', '#'+id, label);

    return container;
  };
  


  // destroyLubanElement handlers
  // these implementations are correlated to the implementations in weaver.web.DocumentMill
  
  //  default
  $.fn.destroyLubanElement.handle_default = function (element) {
    element.remove();
  };

  //  Tab
  $.fn.destroyLubanElement.handle_Tab = function (element) {
    var parent = element.parent();
    var ul = parent.find('ul');
    var lis = ul.children();
    var theli = $('#lifor'+element.attr('id'));
    index = lis.index(theli);
    parent.tabs('remove', index);
  };



  // helper function
  function argStr(args) {
    var assignments = [];
    for (var k in args) {
      v = args[k];
      assignment = k+'='+v;
      assignments.push(assignment);
    }
    return assignments.join('&');
  }
  
  // prepend 'actor.' to keys
  function prependActorStr(args) {
    var d = {};
    for (var k in args) {
      var k1 = 'actor.'+k;
      d[k1] = args[k];
    }
    return d;
  }


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
    var callback = kwds.callback;
    var url = C.url;

    var responsetype = kwds.responsetype;
    if (responsetype==null)
      responsetype = 'json';

    // call
    var args = {'actor': actor,
		'routine': routine};

    // data
    var data = kwds.data;
    if (data == null) data = {};

    // credential
    var credArgs = C.getCredentialArgs();

    // all
    var allargs = $.extend({}, args, data, credArgs);

    $.get(url, allargs, callback, responsetype);

    return;
  };

  // given instructions to change user interface, execute them
  C.execUIUpdateInstructions = function(data, textStatus) {

    // decompose data
    var html = data.html;
    var includes = data.includes;
    var script = data.script;
    
    // don't know how html can be useful at this moment
    // html;
    
    // include scripts
    for (var index in includes) {
      var include = includes[index];
      $.getScript(include);
    };
    
    // run script
    eval(script);
  };


  // load from server and execute commands in the response
  // kwds: a dict
  //   actor: the name of the actor
  //   routine: the name of the routine
  //   data: a dictionary of additional parameters to send to the server
  C.load = function(kwds) {
    var callback = C.execUIUpdateInstructions;
    kwds.callback = callback;
    C.call(kwds);
  };


  // notify the server the changes made to a row in the table
  // and execute commands in the response
  // table: the table where one row changed
  // kwds: a dict
  //   actor: the name of the actor
  //   routine: the name of the routine
  //   data: a dictionary of additional parameters to send to the server
  C.notifyTableRowChanged = function(table, kwds) {
    var rowChangedData = table.data('rowChangedData');
    rowChangedData = prependActorStr(rowChangedData);
    var data = kwds.data;
    var tmp = $.extend({}, data, rowChangedData);
    kwds.data = tmp;
    
    var callback = C.execUIUpdateInstructions;
    kwds.callback = callback;
    C.call(kwds);
  };


  // submit form to server and get response and execute commands in the response
  // form: the form to submit
  // kwds: a dict
  //   actor: the name of the actor
  //   routine: the name of the routine
  //   data: a dictionary of additional parameters to send to the server
  C.submit = function(form, kwds) {
    var callback = C.execUIUpdateInstructions;
    kwds.callback = callback;
    form.submitTo(kwds);
  };


  // clear error boxes in the form
  C.clearFormErrorAlerts = function(form) {
    form.find('.error').hide().text('');
  };

  
  // create the credentail data to be send to the server
  C.getCredentialArgs = function() {
    var credential = C.credential;
    if (credential == null)
      return {};

    var ret = {};
    var username = credential.username;
    if (username != null) ret['sentry.username'] = username;
    
    var ticket = credential.ticket;
    if (ticket != null) ret['sentry.ticket'] = ticket;

    return ret;
  };
  
 })(jQuery, lubanController);


// End of file
