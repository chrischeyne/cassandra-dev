// -*- JavaScript -*-
//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
//                                   Jiao Lin
//                      California Institute of Technology
//                         (C) 2008 All Rights Reserved  
//
// {LicenseText}
//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//


// needs 
//   - ui.progressbar.js

// also refer to
//   - content/base/actors/itask.odb


(function($) {

  $.fn.itaskmonitor = function(action, options) {
    
    // action: "start", "destroy"
    
    if (action == "create") create(this, options);
    else if (action == "start") start(this, options);
    else if (action == 'destroy') destroy(this, options);
    else {};

  };

  function create(itaskdiv, options) {
    
    var updateurl = options.updateurl; // url to update progress of task
    var callback = options.callback; // call back function when task is done
    var starturl = options.starturl; // url to start task
    var title = options.title;
    
    var itask = $(itaskdiv);

    var titletag = $('<h4 class="itasktitle">'+title+'</h4>');
    itask.append(titletag);

    var pbar = $('<div class="itaskprogressbar"></div>'); 
    itask.append(pbar);

    var statuslabel = $('<div></div>');
    itask.append(statuslabel);
    
    var interval;

    function refresh() {
      $.getJSON(updateurl, function(data, textStatus) {
	  var value = data.percentage*100;
	  pbar.progressbar('value', value);
	  statuslabel.text(data.message);
	  if (data.state=="finished" || data.state=='failed' || data.state=='cancelled') {
	    window.clearInterval(interval);
	    
	    itask.itaskmonitor("destroy");
    
	    if (data.state=="failed") {

	      itask.text("failed: ");
	      var errmsg = $("<pre>"+data["reason-of-failure"]+"</pre>");
	      itask.append(errmsg);

	    } else if (data.state=="cancelled") {

	      itask.text("cancelled");

	    } else if (data.state=="finished") {

	    } else {

	      itask.text("unknown state: " + data.state);

	    }

	    callback(data);
	  }
	});
    }

    // start by first ask server to start the task, and then create progress bar
    function start() {
      $.getJSON(starturl, function(data, textStatus){
	  if (data.status != "succeeded") {
	    alert("failed to start task!\n" + data['reason-of-failure']);
	    return;
	  }
	  // create progress bar
	  pbar.progressbar({value:0});
	  
	  // repeat refresh
	  interval = window.setInterval(refresh, 200);
	});
    }
    itask.data('start-func', start);
    itask.hide();
  }

  function start(itaskdiv, options) {
    var itask = $(itaskdiv);
    itask.show();
    itask.data('start-func')();
  }

  function destroy(itaskdiv) {
    var itask = $(itaskdiv);
    var pbar = itask.find(".itaskprogressbar");
    pbar.progressbar('destroy');
  }

 }) (jQuery);


// End of file
