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


(function ($) {

  $.fn.submitWithAjax = function(options) {
    var defaults = {
      callback: null,
      responsetype: 'script',
    };
    var opts = $.extend( {}, defaults, options );

    this.submit(function() {
	var data = $(this).serialize();
	$.post(this.action, data, opts.callback, opts.responsetype);
	return false;
      })
    return this;
  };
  
 })(jQuery);

// End of file
