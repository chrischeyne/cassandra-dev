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
  dmp.onuploader = dmp._onElement;


  // uploader
  ef.uploader = function (kwds, docmill, parent) {
    var Class = kwds.Class;
    var id = kwds.id;
    var div = tag('div', {'id': id});

    var ret = div.lubanElement('uploader');
    if (parent) {parent.add(ret);}
    
    div.addClass(Class);
    div.addClass('luban-uploader');

    var uploaderdiv = tag('div'); div.append(uploaderdiv);

    var onsubmit = kwds.onsubmit;
    // onsubmit must be a simple load action
    if (onsubmit.type!='loading') {throw 'uploader.onsubmit must be a load action';}
    var actor = onsubmit.actor; var routine = onsubmit.routine; var data = onsubmit.params;
    var C = luban.Controller;
    var credArgs = C.getCredentialArgs();
    data = C.prependActorStr(data);
    var parameters = $.extend({}, {'actor':actor, 'routine':routine}, data, credArgs);
    var name = kwds.name;
    var label = kwds.label;
    var oncomplete = kwds.oncomplete, oncomplete_callback;
    if (oncomplete) {
      oncomplete_callback = function () {
	docmill.compile(oncomplete);
      };
    }
    uploaderdiv.uploader(label, name, C.url, parameters, oncomplete_callback);
    
    return ret;
  };

  widgets.uploader = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  // self check
  widgets.uploader.selfcheck = function() {
    var required;
    try {
      required = AjaxUpload;
    } catch (e) {
      //throw;
      return true;
    }
    return required == null;
  };
  widgets.uploader.prototype = new widgets.base ();


  // jquery like syntax to make a div a uploader button
  //  name: name of the uploader
  //  action: the url of the controller that takes action on the uploaded stuff
  //  parameters: parameters to controller
  $.fn.uploader = function(label, name, action, parameters, oncomplete) {
    
    // "this" is the division for the button
    var div = $(this);

    // create the subelments
    var table = tag('table');
    div.append(table);
    var tbody = tag('tbody');
    table.append(tbody);
    var tr = tag('tr');
    tbody.append(tr);
    var buttontd = tag('td');
    tr.append(buttontd);
    var buttondiv = tag('div', {'class': 'luban-uploader-button-container'});
    buttontd.append(buttondiv);
    var button = tag('div', {'class': 'luban-uploader-button'});
    buttondiv.append(button);
    var statustd = tag('td');
    tr.append(statustd);
    var status = tag('div');
    statustd.append(status);
    
    button.text(label);
    
    // the interval callback
    var interval;
    
    var ajaxupload = new Ajax_upload(button, 
    {action: action, 
     data: parameters,
     name: name,
     onSubmit : function(file, ext){
	// change button text, when user selects file			
	status.text('Uploading');
	
	// If you want to allow uploading only 1 file at time,
	// you can disable upload button
	this.disable();
			
	// Uploding -> Uploading. -> Uploading...
	interval = window.setInterval(function(){
	    var text = status.text();
	    if (text.length < 13){
	      status.text(text + '.');					
	    } else {
	      status.text('Uploading');				
	    }
	  }, 200);
      },
     onComplete: function(file, response){
	window.clearInterval(interval);
	
	// enable upload button
	this.enable();
	
	// show filename
	status.text("'"+ file +"' uploaded");

	// run callback
	if (oncomplete)
	  {oncomplete();}
      }
    });

  };
  
  
})(luban, jQuery);


// End of file
