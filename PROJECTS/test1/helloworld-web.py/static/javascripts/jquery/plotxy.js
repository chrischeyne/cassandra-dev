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


// needs elementFactory.js

/* this is partially derived from a flot example */

(function($) {

  $.fn.plotxy = function(X,Y, options) {

    var mainplot_opts = options.mainplot;
    if (mainplot_opts!=undefined) {
      var mainplot_size = mainplot_opts.size;
      var plot_opts = mainplot_opts.plot;
    }
    if (mainplot_size==undefined)
      mainplot_size = {
	'width': '500px',
	'height': '300px'
      };
    if (plot_opts==undefined) 
      plot_opts = {
        legend: { show: false },
	lines: { show: true },
	points: { show: true },
	yaxis: { ticks: 10 },
	selection: { mode: "xy" }
      };

    var miniature_opts = options.miniature;
    if (miniature_opts!=undefined) {
      var miniature_style = miniature_opts.style;
      var miniature_size = miniature_opts.size;
    }
    if (miniature_style==undefined)
      miniature_style = {
	'float': 'left',
	'margin-left': '20px',
	'margin-top': '50px'
      };
    if (miniature_size==undefined)
      miniature_size = {
	'width': '166px',
	'height': '100px'
      };

    var $this = $(this);
    var myid = $this.attr('id');
    var mainpanelid = myid+':'+'mainpanel';
    var mainplotid = myid+':'+'mainplot';
    var miniaturepanelid = myid+':'+'miniaturepanel';
    var miniatureid = myid+':'+'miniature';
    var miniaturelegendid = myid+':'+'miniaturelegend';

    var factory = elementFactory;

    var mainpaneldiv = factory.createDiv(mainpanelid, {'float': 'left'});
    $this.append(mainpaneldiv);
    
    var mainplotdiv = factory.createDiv(mainplotid, mainplot_size);
    mainpaneldiv.append(mainplotdiv);

    var miniaturepaneldiv = factory.createDiv(miniaturepanelid, miniature_style);
    $this.append(miniaturepaneldiv);
    
    var miniaturediv = factory.createDiv(miniatureid, miniature_size);
    miniaturepaneldiv.append(miniaturediv);

    legend_style = {'id': miniaturelegendid, 'style': 'margin-left:10px'};
    var miniatureLegend = factory.createParagraph('', legend_style);
    miniaturepaneldiv.append(miniatureLegend);

    function getYLimits() {
      var min = Y[0], max = Y[0];
      
      for (var i=1; i<Y.length; i+=1) {
	if (Y[i]<min) min = Y[i];
	if (Y[i]>max) max = Y[i];
      }
      return {"min": min, "max": max};
    }
    
    // setup plot
    function getData(x1, x2) {
      var d = [];
      for (var i = 0; i < X.length; i += 1) {
	if (X[i] >= x1 && X[i] <= x2) 
	  d.push([X[i], Y[i]]);
      }
      return [
    { label: "", data: d }
	      ];
    }

    var startData = getData(X[0], X[X.length-1]);
    var ylimits = getYLimits();
    
    var mainplot = $.plot(mainplotdiv, startData, plot_opts);

    // setup miniature
    var miniatureplot = $.plot(miniaturediv, startData, {
        legend: { show: true, container: miniatureLegend },
        lines: { show: true, lineWidth: 1 },
        shadowSize: 0,
        xaxis: { ticks: 4 },
        yaxis: { ticks: 3, min: ylimits.min, max: ylimits.max },
        grid: { color: "#999" },
        selection: { mode: "xy" }
    });

    // now connect the two
    var internalSelection = false;
    
    mainplotdiv.bind("selected", function (event, area) {
        // clamp the zooming to prevent eternal zoom
        if (area.x2 - area.x1 < 0.00001)
            area.x2 = area.x1 + 0.00001;
        if (area.y2 - area.y1 < 0.00001)
            area.y2 = area.y1 + 0.00001;
        
        // do the zooming
        mainplot = $.plot(mainplotdiv, getData(area.x1, area.x2),
                      $.extend(true, {}, plot_opts, {
                          xaxis: { min: area.x1, max: area.x2 },
                          yaxis: { min: area.y1, max: area.y2 }
                      }));
        
        if (internalSelection)
            return; // prevent eternal loop
        internalSelection = true;
        miniatureplot.setSelection(area);
        internalSelection = false;
    });
    miniaturediv.bind("selected", function (event, area) {
        if (internalSelection)
            return;
        internalSelection = true;
        mainplot.setSelection(area);
        internalSelection = false;
    });

  };

 }) (jQuery);


// End of file
