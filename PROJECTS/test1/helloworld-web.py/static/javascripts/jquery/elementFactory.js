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


var elementFactory = {};

(function (d, $) {

  d.createDiv = function(id, style) {

    var name = 'div';
    var kwds = {};
  
    kwds['id'] = id;
    kwds['style'] = _styleStr(style);
    
    return d.createTag(name, kwds);
  };

  d.createParagraph = function(id, style) {

    var name = 'p';
    var kwds = {};
    
    kwds['id'] = id;
    kwds['style'] = _styleStr(style);
    
    return d.createTag(name, kwds);
  };

  d.createTag = function(name, kwds) {

    var assignments = [];
    
    for (var key in kwds) {
      var value = kwds[key];
      assignments.push( key + '=' + '"' + value + '"' );
    }
    
    var  s = "<" + name + ' ' + assignments.join(' ') + ">" + "</"+name+">";
    
    return $(s);
  };

  function _styleStr(style) {
    var assignments = [];
    for (var key in style) {
      var value = style[key];
      assignments.push(key+':'+value);
    }
    return assignments.join(';');
  }

 })(elementFactory, jQuery);

// End of file
