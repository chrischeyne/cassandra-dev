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


// slidableGallery

// Developed from jquery ui example: http://jqueryfordesigners.com/slider-gallery/
// Convert a list (<li>) of items to be contained in a slider
// 

// requires:
//   jquery main:
//     jquery.js
//   jquery ui:
//     ui.core.js
//     ui.slider.js
//
// 


(function($) {

  // turn a division with a list of images into a "slider"
  // the division must have a section of <ul>, each <li> should be an image
  // The division must have a subdivision containing a slider division and
  //   a few "categories". Here is an example:
  //             <div class="slider">
  //                 <div class="handle"></div>
  //                 <span class="slider-lbl1">Wi-Fi</span>
  //                 <span class="slider-lbl3">Macs</span>
  //                 <span class="slider-lbl4">Applications</span>
  //                 <span class="slider-lbl5">Servers</span>
  //             </div>
  $.fn.slidableGallery = function ( slider_labels ) {

    // dimensions
    // !! these cannot be changed... 
    // The reason is the images for the slider has fixed widths...
    width = 560 // width of widget
    sliderwidth = 542;

    // 
    containerheight = 160;
    sliderheight = 17; // should be adjustable?
    spacer = 3;  // space between ul and slider
    slidery = 140; // slider position relative to the container
	
    container = this;
    //
    container.addClass( 'slidableGallery' );
    container.width( width );

    // everytime an item loaded, check whether all items are loaded
    // if all items are loaded, emit "slider-images-all-loaded"
    container.bind( 'slider-item-loaded', function() {
	$this = $(this);
	nloaded = $this.data( 'number-of-images-loaded' );
	if (nloaded == undefined) nloaded = 0;
	nloaded += 1;
	$this.data( 'number-of-images-loaded', nloaded );
	if (nloaded == $($this.children('ul')).find('img').length) {
	  $this.trigger( 'slider-images-all-loaded' );
	}
      } );

    // when all items loaded, add a slider and set up machineries fo
    // sliding.
    container.bind( 'slider-images-all-loaded', function() {
	
	// debug
	// console.log( 'debug' );


	// calculate the total length of images
	var container = $(this); 
	var ul = $('ul', container);
	var itemsWidth = ul.innerWidth() - container.outerWidth();
	var ulheight = ul.height();

	//container.height( ulheight + sliderheight + spacer );
	container.height( containerheight );
	
	// add slider and labels
	sliderdiv = $( '<div class="slider"/>' );
	sliderdiv.width( sliderwidth );
	sliderdiv.height( sliderheight );
	//sliderdiv.css( 'margin-top', ulheight + spacer );
	sliderdiv.css( 'margin-top', slidery );

	sliderhandle = $( '<div class="handle"/>' ) ;
	sliderhandle.height( sliderheight );
	//sliderhandle.width( sliderwidth*1.0/itemsWidth*sliderwidth );
	sliderdiv.append( sliderhandle );

	for (i=0; i<slider_labels.length; i++) {
	  label = slider_labels[i];
	  position = label.position;
	  text = label.text;
	  labelhtml = $('<span>'+text+'</span>');
	  labelhtml.css( 'left', sliderwidth * position + 'px' );
	  sliderdiv.append( labelhtml );
	}
	container.append( sliderdiv );

	$('.slider', container).slider( {
	    min: 0,
	    max: itemsWidth,
	    handle: '.handle',
	    stop: function (event, ui) {
	      ul.animate({'left' : ui.value * -1}, 500);
	    },
	    slide: function (event, ui) {
	      ul.css('left', ui.value * -1);
	    }
	  });
      });

    // find all images and ask them to emit slider-items-loaded when loaded
    container.find( 'img' ).load( function () {
	
	container.trigger( 'slider-item-loaded' );

      });

  };

 }) (jQuery);

// version
// $Id$

// End of file 
