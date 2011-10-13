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

  // declaration of local helper functions
  var setupPlot;

  // aliases
  var ef = luban.elementFactory;
  var widgets = luban.widgets;
  var tag = luban.utils.tag;

  // documentmill handler
  var dmp = luban.documentmill.prototype;
  dmp.onplot2d = dmp._onElement;


  // 2d plot
  //  factory
  // implementation: depends on flot
  ef.plot2d = function(kwds, docmill, parent) {
    var div = tag('div', {'id': kwds.id});
    div.addClass('luban-plot2d');
    
    var kls = kwds.Class;
    if (kls) {div.addClass(kls);}
    
    var ret = div.lubanElement('plot2d');
    if (parent) {parent.add(ret);}

    var plotdiv = tag('div'); div.append(plotdiv);
    plotdiv.addClass('plot');
    setupPlot(kwds, plotdiv);

    var captiondiv = tag('div'); div.append(captiondiv);
    captiondiv.addClass('caption');
    if (kwds.caption) {
      captiondiv.text(kwds.caption);
    }
    return ret;
  };
  //  object
  widgets.plot2d = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.plot2d.prototype = new widgets.base ();


  // helper
  setupPlot = function (plot, div) {
	
    // flot panel needs to know its size
    var wd = div.width(), ht = div.height();
    if (wd<5 || ht<5) {
      wd = 300; ht = 200;
      div.width(wd); div.height(ht);
    }

    // setup curves
    var curves = plot.curves;
    if (curves) {
      var data = [];
      for (var i in curves) {
	var curve = curves[i];
	var cdata = {
	  'label': curve.label,
	  'data': []
	};
	var tmp = cdata['data'];
	for (var j in curve.x) {
	  var xj = curve.x[j]; var yj = curve.y[j];
	  tmp.push([xj, yj]);
	}
	data.push(cdata);
      }
      var options = {
      lines: { show: true },
      points: { show: true },
      xaxis: { tickDecimals: 5 },
      yaxis: {},
      selection: { mode: "xy" }
      };
      if (plot.xticks && plot.xticks.length) {
	options.xaxis.ticks = plot.xticks;
      }
      if (plot.yticks && plot.yticks.length) {
	options.yaxis.ticks = plot.yticks;
      }

      // zoom in
      div.bind("plotselected", function (event, ranges) {
	  plot = $.plot(
			div, data,
			$.extend(
				 true, {}, options, {
				   'xaxis': { min: ranges.xaxis.from, max: ranges.xaxis.to },
				     'yaxis': { min: ranges.yaxis.from, max: ranges.yaxis.to }
				 }));
	});

      // right click to zoom out
      div.rightClick(function () {
	  plot = $.plot(div, data, options);
	});
      
      // bring up the plot
      $.plot(div, data, options);
    }
  };
 })(luban, jQuery);

// End of file
