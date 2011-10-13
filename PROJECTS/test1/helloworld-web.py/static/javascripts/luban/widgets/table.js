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

  // declare helpers
  var createColumnDescriptors, descriptortype2tabletype;
  
  // aliases
  var ef = luban.elementFactory;
  var widgets = luban.widgets;
  var tag = luban.utils.tag;


  // documentmill handler
  var dmp = luban.documentmill.prototype;
  dmp.ontable = dmp._onElement;

  // actioncompiler handler
  var lap = luban.actioncompiler.prototype;
  //  
  lap.ontablegetidentifiersforcheckedrows = function(action) {
    var table = this.dispatch(action.element);
    var colname = action.params.colname;
    return table.getIdentifiersForCheckedRows(colname);
  };
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // this is obsolete
  lap.ontablegetidentifiersforselectedrow = function(action) {
    luban.utils.log('WARNING', 'action table("getIdentifiersForSelectedRow") is obsolete, use table("getIdentifierForSelectedRow")');
    var table = this.dispatch(action.element);
    var colname = action.params.colname;
    return table.getIdentifierForSelectedRow(colname);
  };
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  lap.ontablegetidentifierforselectedrow = function(action) {
    var table = this.dispatch(action.element);
    var colname = action.params.colname;
    return table.getIdentifierForSelectedRow(colname);
  };
  lap.ontableappendrow = function(action) {
    var table = this.dispatch(action.element);
    var row = action.params.row;
    return table.appendrow(row);
  };  
  lap.ontablemakecolsortable = function(action) {
    var table = this.dispatch(action.element);
    var colname = action.params.col;
    return table.makecolsortable(colname);
  };  
  lap.ontabledeleterows = function(action) {
    var table = this.dispatch(action.element);
    var rows = luban.docmill.actioncompiler.compile(action.params.rows);
    return table.deleterows(rows);
  }
  lap.ontablesetvisiblecols = function(action) {
    var table = this.dispatch(action.element);
    var cols = luban.docmill.actioncompiler.compile(action.params.cols);
    return table.setVisibleColumns(cols);
  }

  // init options for tabulator
  $.tabulator.opts.iconroot = luban.configuration.icons_base;

  // table
  //  factory
  ef.table = function(kwds, docmill, parent) {
    // 
    Date.firstDayOfWeek = 7;
    Date.format = "mm/dd/yyyy";

    // the table container
    //var thetablediv = tag('div', {id: kwds.id+'-container'});

    // the table
    var column_descriptors = createColumnDescriptors(kwds);
    //var thetable = tableFactory.createTable(kwds.id, thetablediv, column_descriptors);
    //var thetable = tableFactory.createTable(kwds.id, parent._je, column_descriptors);
    var thetable = tableFactory.createTable(kwds.id, null, column_descriptors);
    var ret = thetable.lubanElement('table');
    parent.add(ret);

    // classes
    thetable.addClass( "tabulated" );
    var kls = kwds.Class;
    if (kls) {thetable.addClass(kls);}
    
    // the columns that act as row identifier
    var row_identifiers = kwds.model.row_identifiers;
    if (row_identifiers != null) {
      thetable.data("row-identifying-cols", row_identifiers);
    }

    // editable ?
    if (kwds.view.editable) {
      thetable.data('editable', 1);
    }
    // handle cell-changed event
    var oncellchanged;
    if (kwds.oncellchanged) {
      oncellchanged = createCellChangedHandler(thetable, kwds.oncellchanged);
    }
    thetable.table_setOncellchanged(oncellchanged);

    // data
    var data = kwds.data, rows = [];
    for (var i in data) {
      var row = {
	'id': i,
	'data': data[i]
      };
      rows.push(row);
    }
    thetable.table_appendrows_dataonly(rows);

    //return thetable.lubanElement('table');
    return ret;
  };
  //  object
  widgets.table = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  widgets.table.prototype = new widgets.base ();

  // append a row
  widgets.table.prototype.appendrow = function(row, rowid) {
    this._je.table_appendrow_dataonly(rowid, row);
  };

  // delete rows
  // rows: identifiers for all rows
  widgets.table.prototype.deleterows = function(rows) {
    var ids_rowstodelete = luban.utils.deepCopy(rows);
    var allrows = this._je.find('tbody').children('tr');
    var found;
    var rows_todelete = [];
    for (var i=0; i<allrows.length; i++) {
      var row = $(allrows[i]);
      var identifier = this.getIdentifiersForRow(row);
      found = null;
      for (var j=0; j<ids_rowstodelete.length; j++) {
	if (identifier==ids_rowstodelete[j]) {found=j;}
      }
      if (found != null) {
	rows_todelete.push(row);
	ids_rowstodelete.splice(found,found);
      }
    }
    for (var i=0; i<rows_todelete.length; i++) {
      rows_todelete[i].remove();
    }
  };

  // set the given columns to visible, and hide other columns
  // cols: names of columns to be set visible
  widgets.table.prototype.setVisibleColumns = function(cols) {
    // show all cols
    var tr = this._je.children().children('tr');
    tr.children('td').show();
    
    // find cols to hide and hide them
    var column_descriptors = this.getColumnDescriptors();
    for (var i in column_descriptors) {
      var descriptor = column_descriptors[i];
      var colname = descriptor.name;
      if ($.inArray(colname, cols)==-1) {
	tr.children('td[colname="'+colname+'"]').hide();
	descriptor.hidden = true;
      } else {
	descriptor.hidden = false;
      }
    }
  };

  // column descriptors
  widgets.table.prototype.getColumnDescriptors = function() {
    return this._je.data('column_descriptors');
  };

  // get the identifying data for every row that are checked
  widgets.table.prototype.getIdentifiersForCheckedRows = function(colname) {
    var table = this._je;
    var rows = table.get_checked_rows(colname);
    if (!rows) {return;}

    var ret = [];
    for (var i=0; i<rows.length; i++) {
      var row = $(rows[i]);
      var data = this.getIdentifiersForRow(row);
      ret.push(data);
    }

    return ret;
  };
  // !!! this is different from getIdentifiersForCheckedRows !!!
  // get the identifying data for the ONE ROW that is selected
  widgets.table.prototype.getIdentifierForSelectedRow = function(colname) {
    var table = this._je;
    var rows = table.get_checked_rows(colname);
    if (!rows) {return;}
    if (rows.length == 0) {return;}
    if (rows.length > 1) {throw "more than one rows are selected";}
    var row = $(rows[0]);

    return this.getIdentifiersForRow(row);
  };
  // get the identifying data for the given row. row must be a jquery object
  widgets.table.prototype.getIdentifiersForRow = function(row) {
    var table = this._je;
    var row_identifying_cols = table.data('row-identifying-cols');

    if (row_identifying_cols.length==1) {
      var col = row_identifying_cols[0];
      return row.get_colvalue_from_row(col);
    } else if (row_identifying_cols.length>1) {
      var t = [];
      for (var j=0; j<row_identifying_cols.length; j++) {
	var col1 = row_identifying_cols[j];
	t.push(row.get_colvalue_from_row(col1));
      }
      return t;
    } else {
      // ***** by default return the index of the row as the identifier *****
      return row.index();
    }

    throw "should not reach here";
  };
  // make a column sortable
  widgets.table.prototype.makecolsortable = function(colname) {
    var table = this._je;
    
    table.sortable_column(colname);
  };
  
  //
  // extensions to jquery needed for table
  //
  // set rowChangedData of the table from the cell
  $.fn.setRowChangedDataFromCell = function(cell) {
    var table = $(this);
    cell = $(cell);
    var row = cell.parent();
    
    var data = {};
    var row_identifying_cols = table.data('row-identifying-cols');
    for (var i in row_identifying_cols) {
      var colname = row_identifying_cols[i];
      var value = row.get_colvalue_from_row(colname);
      data[colname] = value;
    }
    data[cell.attr('colname')] = cell.extract_data_from_cell();

    table.data('row-changed-data', data);
  };


  // helpers

  function createCellChangedHandler(table, action) {
    var f = function(cell) {
      table.setRowChangedDataFromCell(cell);
      luban.docmill.compile(action);
      return false;
    };
    return f;
  }

  // from table description, create column descriptors
  createColumnDescriptors = function (table) {

    // model
    var model = table.model;
    var measures = model; // this might change later to a more complex structure

    // view
    var view = table.view;
    var cols = view.columns;
    
    // now create column descriptors
    var column_descriptors = {};
    for (var i in cols) {
      var col = cols[i];
      var measurename = col.measure;
      var measure = measures[measurename];
      var name = measure.name;
      var descriptor = column_descriptors[name] = {};

      descriptor['name'] = name;
      descriptor['text'] = col.label;
      descriptor['editable'] = col.editable && view.editable;
      descriptor['datatype'] = descriptortype2tabletype[measure.type];
      descriptor['sortable'] = col.sortable && view.sortable;
      descriptor['hidden'] = col.hidden;
    }

    return column_descriptors;
  };


  // map descriptor type to table type system
  descriptortype2tabletype = {
    'int': 'int',
    'float': 'float',
    'str': 'text',
    'date': 'date',
    'link': 'link',
    'bool': 'boolean',
    'radio_button': 'single_choice_in_one_column'
  };

 })(luban, jQuery);


// End of file
