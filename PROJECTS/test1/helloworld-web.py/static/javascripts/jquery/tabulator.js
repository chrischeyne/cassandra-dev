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


// tabulator


// some meta data are saved in cells to allow sorting, formatting.
// some other meta data are stored in table.data('column_descriptors')
// 
// columns are identified by their ids (string).
// rows are identified by their ids (usually numbers).
// 
// The last row in the table head is regarded as the row that 
// describes the columns in the table. 
// The attribute 'colname' of a cell in that row is regarded as the
// name (which is unique among columns) of the column.
// Each cell in that column will have an attribute "colname" and
// it should be the same as the column name.
//
// Right now, there is no way to know "row number" given a row.
// This might cause trouble if you need to know, for example, what is
// the cell above or below a given cell.
// But, what would be the use case? Running balance could be one, but
// do we really care?
//
// A cell could be editable. Actually this is now controlled by two things.
// table.data('editable') dictates whether the whole table is editable.
// It overrides the individual settings.
// column_descriptors.<colname>.editable dictates whether the cells
// in on column is editable or not.
// When edit finish, an event handler stored in table.data('oncellchanged')
// will be called to handle the event. The signature of the event handler
// is
//    function handler(cell) 
// where cell is the changed cell.

// todo:
//  UI 
//   1. add a new row, delete existing row ( google map for example )
//   2. resizable columns (less important)
//   3. numeric cell should allow calculator
//   4. locale ( for calendar and money, for example )
//  talking to server
//   1. ajax?


(function($) {

  // ********************************************
  //  public data added to jQuery
  // ********************************************
  $.tabulator = {};
  $.tabulator.opts = {};

  // ********************************************
  //  public methods added to jQuery
  // ********************************************

  // ---------------------
  // table meta data setup
  // ---------------------

  // set column descriptors for a table
  // a column descriptor describe the properties of a column, such
  // as name, type, sorting direction? 
  $.fn.table_setcolumndescriptors = function ( descriptors ) {
    $(this).data( 'column_descriptors', descriptors );
  };

  // get column descriptors
  $.fn.table_getcolumndescriptors = function() {
    return $(this).data('column_descriptors');
  };


  // ---------------------
  // table manipulations
  // ---------------------

  // is this table editable?
  $.fn.table_isEditable = function() {
    return $(this).data('editable');
  };
  
  // setter and getter for event handler oncellchanged
  $.fn.table_setOncellchanged = function(handler) {
    $(this).data('oncellchanged', handler);
  };
  $.fn.table_getOncellchanged = function () {
    return $(this).data('oncellchanged');
  };
  
  // make a cell editable (when double clicked, an edit widget will show up)
  $.fn.table_makeCellEditable = function(cell) {
    // event handler for cell change
    var callback = function () {
      var cell = $(this);
      var row = cell.parent();
      var body = row.parent();
      var table = body.parent();
      var oncellchanged = table.table_getOncellchanged();
      cell.enable_cell_editing(oncellchanged);
    };
    // bind to double click
    $(cell).dblclick(callback);
  };

  // make a row editable 
  $.fn.table_makeRowEditable = function(row) {
    var $this = $(this);
    var column_descriptors = $this.table_getcolumndescriptors();
    for (var i1 in column_descriptors) {
      var coldescriptor = column_descriptors[i1];
      if (coldescriptor.editable == null || !coldescriptor.editable) {continue;}
      var name = coldescriptor.name;
      var cell = row.find("td[colname='"+name+"']");
      $this.table_makeCellEditable(cell);
    }
  };

  // make a column sortable
  $.fn.sortable_column = function(colname) {
    var thetable = this;

    // add ctrls to head cells
    var hcell = get_head_cell(this, colname);
    reset_sorting_mark(this, colname);

    hcell.attr('direction', 0);

    hcell.click( function () {
	var $this = $(this);
	
	reset_all_sorting_marks(thetable);
	
	direction = $this.attr( 'direction' );
	direction = direction == 0? 1:0;
  
	set_sorting_direction(thetable, colname, direction);
      } );
  };

  // sort a table by a column
  // this -> table
  $.fn.sort_table_by_col = function( colname, direction ) {

    // save rows before we remove them from the table
    var saverows = [];
    var body = get_tablebody( this );
    var rows = body.children();
    var row;
    for (var i = 0; i<rows.length; i++) {
      row = rows[i];
      saverows.push( row );
    }
    body.empty();
    
    column_descriptors = this.data('column_descriptors');
    var newrows = sort_rows_by_col_dataonly( saverows, colname, column_descriptors, direction );
    
    for (var i=0; i<newrows.length; i++) {
      row = newrows[i];
      this.table_appendrow_dataonly(i, row);
    }
  };


  // get rows that are "checked"
  // assume the given column is one column of check boxes.
  // this function returns the rows for which the check box in the given column are checked
  $.fn.get_checked_rows = function(colname) {
    if (colname==null) throw "table.get_checked_rows: colname cannot be null";
    var body = get_tablebody( this );
    var rows = body.children();
    if (rows.length==0) return;
    
    var cells = $(rows[0]).children();
    var colno = find_column_no( colname, cells);
    if (colno==null) return;
    
    var ret=[];
    for (var i=0; i<rows.length; i++) {
      var row = rows[i];
      cells = $(row).children();
      var cell = cells[colno];
      if ($(cell).find('input:checked').length) ret.push(row);
    }
    return ret;
  };


  // get column no of given column name
  $.fn.get_col_no = function(colname) {
    var body = get_tablebody( this );
    var rows = body.children();
    if (rows.length==0) return;
    
    var cells = $(rows[0]).children();
    var colno = find_column_no( colname, cells);
  }
  
  // extract data from a row. 
  // return: a tuple of values, each value from a cell
  $.fn.extract_data_from_row = function() {
    var row = $(this);
    var cells = row.children('td');
    var tuple = [];
    for (var i=0; i<cells.length; i++) {
      var cell = $(cells[i]);
      tuple.push(cell.extract_data_from_cell());
    }
    return tuple;
  }

  // add an edit widget to the cell so that user can edit the value
  $.fn.enable_cell_editing = function ( callback ) {
    
    enable_cell_editing_by_datatype( this );

    // when cell lost focus, we should quit editing mode

    //  "input" or "select"?
    var input = this.children( 'input' );
    if (input.length == 0) input = this.children( 'select' );

    //  focus on input now
    input.focus();
    
    //  
    var cell  = this;
    cell.bind( "restore_from_editing", function() {
	cell.restore_cell_from_editing();
	if (callback) callback( cell );
	cell.unbind( "restore_from_editing" );
      } );
  };

  
  // restore a cell from editable to normal
  $.fn.restore_cell_from_editing = function () {
    restore_cell_from_editing_by_datatype( this );
  }
  

  // extract data value from a cell
  $.fn.extract_data_from_cell = function () {
    var cell = this;
    var datatype = cell.attr( 'datatype' );
    var symbol = '$.fn.extract_data_from_cell.handle_' + datatype;
    var handler = eval(symbol);
    if (!handler) {
      throw 'extract_data_from_cell handler for type ' + datatype + ' not defined';
    }
    return handler( cell );
  };


  // establish a cell given a new value
  $.fn.establish_cell_from_data = function( data ) {
    var cell = this;
    var datatype = cell.attr( 'datatype' );
    var handler = eval( '$.fn.establish_cell_from_data.handle_' + datatype );
    if (!handler) {
      throw 'establish_cell_from_data handler for type ' + datatype + ' not defined';
    }
    return handler( cell, data );
  };


  // get value from an editing widget for a cell
  $.fn.cell_value_from_editing_widget = function() {
    var cell = this;
    var datatype = cell.attr( 'datatype' );
    var handler = eval( '$.fn.cell_value_from_editing_widget.handle_' + datatype );
    return handler( cell );
  };


  // get value of the cell for the given column name in the given row (this)
  $.fn.get_colvalue_from_row = function(colname) {
    var cells  = $(this).children();
    colno = find_column_no( colname, cells);
    cell = $(cells[colno]);
    return cell.extract_data_from_cell();
  };


  // ---------------------
  // basic table creation
  // ---------------------

  // append a row to the end of the table body. 
  // only the data are specified. meta data 
  // will be obtained from "column_descriptors" that is attached to the table
  //
  //   table_appendrow_dataonly( rowid, [cell0, cell1, ...] )
  //
  $.fn.table_appendrow_dataonly = function(rowid, datalist) {

    var tbl = this;

    var ncells = datalist.length;
    
    var column_descriptors = tbl.data( 'column_descriptors' );

    var row = append_newrow_to_table( tbl, rowid );

    fill_row_with_data( row, datalist, column_descriptors );
    
    if (this.table_isEditable()) {
      this.table_makeRowEditable(row);
    }
    
    return row;
  };


  // append a list of rows
  $.fn.table_appendrows_dataonly = function(rows) {
    var tbl = this;
    for (var i=0; i<rows.length; i++) {
      var row = rows[i];
      tbl.table_appendrow_dataonly(row.id, row.data);
    }
  };


  // insert a row to the table body after the row for which the row id is given.
  // only the data are specified. meta data 
  // will be obtained from "column_descriptors" that is attached to the table
  //
  //   table_insertrowafter_dataonly( 'row2a', 'row2', [cell0, cell1, ...] )
  //
  // newrowid: id of the  row to be inserted
  // rowid: id of the row after which the new row will be inserted
  $.fn.table_insertrowafter_dataonly = function(newrowid, rowid, datalist) {

    var tbl = this;

    var column_descriptors = tbl.data( 'column_descriptors' );

    row = insert_newrowafter_to_table( tbl, newrowid, rowid );
    if (row == undefined) return;
    
    fill_row_with_data( row, datalist );
  };



  // ********************************************
  // handlers
  // These handlers can be extended so that the
  // behaviors of this tabulator can be changed
  // ********************************************


  // --------------------------------------
  // handlers to extract data from a cell
  // --------------------------------------
  // text
  $.fn.extract_data_from_cell.handle_text = function( cell ) {
    return cell.text();
  };
  
  // int
  $.fn.extract_data_from_cell.handle_int = function( cell ) {
    return Number(cell.text());
  };

  // float
  $.fn.extract_data_from_cell.handle_float = function( cell ) {
    return Number(cell.text());
  };

  // boolean
  $.fn.extract_data_from_cell.handle_boolean = function( cell ) {
    var input = cell.children('input');
    return input.attr('checked')=='checked';
  };

  // link
  $.fn.extract_data_from_cell.handle_link = function( cell ) {
    return cell.text();
  };
  
  // money
  $.fn.extract_data_from_cell.handle_money = function( cell ) {
    $amount = $(cell.children( 'span.moneyAmount' )[0]);
    amount = $amount.text();
    return Number( amount );
  };
  
  // --------------------------------------
  // handlers to establish a cell from data
  // --------------------------------------
  //  text
  $.fn.establish_cell_from_data.handle_text = function( cell, value ) {
    return cell.html( value ); 
  };
  
  //  int
  $.fn.establish_cell_from_data.handle_int = function( cell, value ) {
    return cell.html( value ); 
  };
  
  //  float
  $.fn.establish_cell_from_data.handle_float = function( cell, value ) {
    var v = Math.abs(value), s;
    if (v!=0 && (v > 1e5 || v < 1e-5))  {
      s = sprintf('%e', value);
    } else {
      s = String(value);
    }
    return cell.html( s ); 
  };
  
  //  link
  $.fn.establish_cell_from_data.handle_link = function( cell, value ) {
    var id = value.id;
    var label = value.label;
    var onclick = value['onclick'];
    
    // remember crucial information in cell
    cell.attr('linkid', id);
    cell.data('onclickaction', onclick);

    // create <a> element
    var html = '<a id="'+id+'">' + label + '</a>';
    // insert into cell
    var ret = cell.html(html); 
    ret.children('a').addClass('luban-link');

    // click action
    $('#'+id).click(function() {luban.docmill.compile(onclick); return false;});

    return ret;
  };
  
  //  date
  $.fn.establish_cell_from_data.handle_date = function( cell, value ) {
    return cell.text( value ).addClass( "date" );
  };
  
  //  boolean
  $.fn.establish_cell_from_data.handle_boolean = function( cell, value ) {
    var checked = Number(value)==0? '':'checked="checked"';
    var html = '<input type="checkbox" ' + checked + ' />';
    cell.css( 'text-align', 'center' );
    return cell.html( html ); 
  };
  
  //  money
  $.fn.establish_cell_from_data.handle_money = function( cell, value ) {
    html = '<span class="moneyCurrencySymbol">$</span>';
    html += '<span class="moneyAmount">' + value.toFixed(2) + '</span>';
    cell.css( 'text-align', 'right' );
    cell.html( html );
  };

  //  updown
  $.fn.establish_cell_from_data.handle_upanddown = function( cell, value ) {
    cell.text( value );
    if (value > 0) 
      return cell.css("color", "green").prepend( '^' );
    else
      return cell.css("color", "red").prepend( 'v' );
  };

  // single_choice
  $.fn.establish_cell_from_data.handle_single_choice = function( cell, value ) {
    column_descriptor = get_column_descriptor( cell );
    choices = column_descriptor.choices;
    text = choices[ value ];
    cell.text( text );
    return cell;
  };  

  //  single choice in one column
  $.fn.establish_cell_from_data.handle_single_choice_in_one_column = function( cell, value ) {

    var descriptor = get_column_descriptor( cell );
    var name = descriptor.name_for_form_action;

    var html = '<input type="radio" ';
    
    var checked, selection_identifier;
    checked = value.selected;
    if (checked == null) {
      checked = Boolean(value);
      selection_identifier = '';
    } else {
      checked = Number(value.selected);
      selection_identifier = value.value;
    }
    
    var checkedstr = checked==0? '':'checked="checked"';
    html += checkedstr;

    //html += 'name="' + cell.attr('name') + '"';
    html += 'name="' + name + '"';

    if (selection_identifier) {
      html += 'value="' + selection_identifier + '"';
    }

    html += '/>';
    
    cell.css( 'text-align', 'center' );
    return cell.html( html ); 
  };

  

  // -----------------------------
  // handlers to compare two cells
  // -----------------------------
  //  money
  $.fn.sort_table_by_col.handle_money = function( value1, value2 ) {
    return value1 - value2;
  };

  //  text
  $.fn.sort_table_by_col.handle_text = function( value1, value2 ) {
    return value1.localeCompare(value2);
  };

  //  int
  $.fn.sort_table_by_col.handle_int = function( value1, value2 ) {
    return value1 - value2;
  };

  //  float
  $.fn.sort_table_by_col.handle_float = function( value1, value2 ) {
    return value1 - value2;
  };

  //  link
  $.fn.sort_table_by_col.handle_link = function( value1, value2 ) {
    return value1.localeCompare(value2);
  };

  // **** need more compare handlers here
  

  // --------------------------------
  // handlers to make a cell editable
  // --------------------------------
  //  text
  $.fn.enable_cell_editing.handle_text = function( cell ) {
    var text = cell.text();
    var width = cell.width();
    var height = cell.height();
    var html = '<input type="text" value ="' + text + '" />'; 
    cell.html( html );
    var input = cell.children('input');
    input.width( width );
    input.height( height );

    input.blur( function () {
	cell = $(this).parent();
	cell.trigger( 'restore_from_editing' );
      } )

    input.bind( 'keydown',  function (e) {
	input = $(this);
	if (e.which != 13 && e.which != 10 ) return true;
	cell = $(this).parent();
	cell.trigger( 'restore_from_editing' );
      } )

  };

  //  int
  $.fn.enable_cell_editing.handle_int = function( cell ) {
    var text = cell.text();
    var width = cell.width();
    var height = cell.height();
    var html = '<input type="text" value ="' + text + '" />'; 
    cell.html( html );
    var input = cell.children('input');
    input.width( width );
    input.height( height );

    input.blur( function () {
	cell = $(this).parent();
	cell.trigger( 'restore_from_editing' );
      } )

    input.bind( 'keydown',  function (e) {
	var input = $(this);
	if (e.which == 13 || e.which == 10 ) {
	  cell = $(this).parent();
	  cell.trigger( 'restore_from_editing' );
	  return false;
	}
	if (e.which >= 65 && e.which <= 90)
	  return false;
	if (e.which >= 186)
	  return false;
	return true;
      });

  };

  //  float
  $.fn.enable_cell_editing.handle_float = function( cell ) {
    var text = cell.text();
    var width = cell.width();
    var height = cell.height();
    var html = '<input type="text" value ="' + text + '" />'; 
    cell.html( html );
    var input = cell.children('input');
    input.width( width );
    input.height( height );

    input.blur( function () {
	cell = $(this).parent();
	cell.trigger( 'restore_from_editing' );
      } )

    input.bind( 'keydown',  function (e) {
	var input = $(this);
	if (e.which == 13 || e.which == 10 ) {
	  cell = $(this).parent();
	  cell.trigger( 'restore_from_editing' );
	  return false;
	}
	if (e.which == 69) 
	  return true;
	if (e.which >= 65 && e.which <= 90)
	  return false;
	if (e.which == 190)
	  return true;
	if (e.which >= 186)
	  return false;
	return true;
      });

  };

  //  link
  $.fn.enable_cell_editing.handle_link = function( cell ) {
    // the link is implemented as
    // <a id=???>label</a>
    var a = cell.find('a');
    
    // the text in a
    var text = a.text();

    // dimensions
    var width = cell.width();
    var height = cell.height();

    // new element would be a form input
    var html = '<input type="text" value ="' + text + '" />'; 
    cell.html( html );
    
    // adjust dimensions of input
    var input = cell.children('input');
    input.width( width );
    input.height( height );

    // restore from editing when lost focus
    input.blur( function () {
	cell = $(this).parent();
	cell.trigger( 'restore_from_editing' );
      } )

    input.bind( 'keydown',  function (e) {
	input = $(this);
	if (e.which != 13 && e.which != 10 ) return true;
	cell = $(this).parent();
	cell.trigger( 'restore_from_editing' );
      } )

  };

  //  date
  $.fn.enable_cell_editing.handle_date = function( cell ) {
    var text = cell.text();
    var width = cell.width();
    var height = cell.height();
    input = $('<input class="date-pick"/>');
    cell.html( input );

    descriptor = get_column_descriptor( cell );
    range = descriptor.valid_range;
    startDate = range[0]; endDate = range[1]

    input
    .datePicker( {createButton:false, startDate: startDate, endDate: endDate } )
    .data( 'saved-date', text )
    .dpSetSelected( text )
    .bind( 'dateSelected', function(e, selected) {
	$this = $(this);
	date = selected.asString();
	$this.attr( 'value', date );
	parent = $this.parent();
	parent.trigger( 'restore_from_editing');
      } )
    .bind( 'dpClosed', function( ) {
	$this = $(this);
	date = $this.data( 'saved-date' );
	$this.attr( 'value', date );
	parent = $this.parent();
	parent.trigger( 'restore_from_editing');
      } )
    .dpDisplay()
    ;

    input.width( width );
    input.height( height );
  };

  //  money
  $.fn.enable_cell_editing.handle_money = function( cell ) {
    var amount = cell.extract_data_from_cell();

    var width = cell.width();
    var height = cell.height();
    var html = '<input type="text" value ="' + amount + '" />'; 
    
    cell.html( html );
    var input = cell.children('input')
    input.width( width );
    input.height( height );
    cell.data( 'saved-value', amount );

    input.bind( 'blur',  function () {
	cell = $(this).parent();
	cell.trigger( 'restore_from_editing' );
      } )
    input.bind( 'keydown',  function (e) {
	input = $(this);
	if (e.which != 13 && e.which != 10 ) return true;
	cell = $(this).parent();
	cell.trigger( 'restore_from_editing' );
      } )
  };

  //  single_choice
  $.fn.enable_cell_editing.handle_single_choice = function( cell ) {
    var text = cell.text();
    var width = cell.width();
    var height = cell.height();
    var choices = cell.data( 'choices' );
    if (choices == undefined) {
      descriptor = get_column_descriptor( cell );
      choices = descriptor.choices;
    }
    
    var options = [];
    
    for (var index in choices) {
      var choice = choices[index];
      var  opt = {'value': index, 'text': choice}
      if (choice == text) opt.selected = 'selected';
      options.push( opt );
    }

    var dl = dropdownlist( options );

    cell.html( dl );

    dl.width( width );
    dl.height( height-2 );

    dl.blur( function () {
	cell = $(this).parent();
	cell.trigger( 'restore_from_editing' );
      } )

    dl.change( function () {
	cell = $(this).parent();
	cell.trigger( 'restore_from_editing' );
      } )

  };

  // dropdownlist( [ {'value': "volvo", 'text': "Volvo"}, ... ] )
  function dropdownlist( options ) {
    var html = '<select>';

    for (var i=0; i<options.length; i++) {
      var opt_info = options[i];
      var tmp = '<option value="' + opt_info.value + '" ';

      if (opt_info.selected) tmp += 'selected="selected"';
      
      tmp += '>' ;
      tmp += opt_info.text + '</option>';
      
      html += tmp;
    } 
    
    html += '</select>';
    
    return $(html);
  }


  // ---------------------------------------------
  // handlers to extract value from editing widget
  // ---------------------------------------------
  //  text
  $.fn.cell_value_from_editing_widget.handle_text = function( cell ) {
    return cell.find( "input" ).attr( 'value' );
  };

  //  int
  $.fn.cell_value_from_editing_widget.handle_int = function( cell ) {
    return Number(cell.find( "input" ).attr( 'value' ));
  };

  //  float
  $.fn.cell_value_from_editing_widget.handle_float = function( cell ) {
    return Number(cell.find( "input" ).attr( 'value' ));
  };

  //  link
  $.fn.cell_value_from_editing_widget.handle_link = function( cell ) {
    var input = cell.find( "input" );
    var label = input.attr( 'value' );
    var onclickaction = cell.data('onclickaction')
    var id = cell.attr('linkid');
    return {'id': id, 'label':label, 'onclick': onclickaction};
  };

  //  date
  $.fn.cell_value_from_editing_widget.handle_date = function( cell ) {
    input = cell.find( "input ");
    value = input.attr('value');
    return value;
  };

  //  money
  $.fn.cell_value_from_editing_widget.handle_money = function( cell ) {
    input = cell.find( "input" )
    value = input.attr( 'value' );
    value = Number(value);
    if (value != undefined && value != '' && value != 'undefined' ) return value;
    return cell.data( 'saved-value' );
  };

  //  single_choice
  $.fn.cell_value_from_editing_widget.handle_single_choice = function( cell ) {
    var select = cell.find( "select" );
    return select.attr('value');
  };


  // ********************************************
  // implementation details
  // ********************************************

  // reset sorting marks to initial status as if there is no sorting
  function reset_all_sorting_marks(thetable) {
    var column_descriptors = thetable.data('column_descriptors');
    for (var name in column_descriptors) {
      var coldescriptor = column_descriptors[name];
      if (coldescriptor.sortable) {
	reset_sorting_mark(thetable, coldescriptor.name);
      }
    }	
  }

  // get the cell in the table head for the given column in the given table
  function get_head_cell(table, colname) {
    var thead = get_tablehead(table);
    var rows = thead.children( 'tr' );
    var lastrow = $( rows[ rows.length -1 ] );
    return lastrow.find("td[colname=\"" + colname + "\"]");
  }

  $.tabulator.opts.iconroot = 'images/icons';
  // sort a table at the given direction and update the marks for sorting
  function set_sorting_direction(table, colname, direction) {
    table = $(table);
    table.sort_table_by_col( colname, direction );
    var hcell = get_head_cell(table, colname);
    var span = hcell.children('span.sort-ctrl');
    var icon = hcell.children('img.sort-ctrl');
    var iconroot = $.tabulator.opts.iconroot;
    if (direction) {
      span.text('v'); icon.attr('src', iconroot+'/sort-down.gif');
    } else {
      span.text('^'); icon.attr('src', iconroot+'/sort-up.gif');
    }
    hcell.attr('direction', direction);
  }

  // reset the mark of sorting for the given column in the given table
  function reset_sorting_mark(table, colname) {
    var hcell = get_head_cell(table, colname);
    var span = hcell.children('span.sort-ctrl');
    if (span.length==0) {
      span = $('<span class="sort-ctrl"></span>');
      hcell.append(span);
    }
    var icon = hcell.children('img.sort-ctrl');
    if (icon.length==0) {
      icon = $('<img class="sort-ctrl" \>');
      hcell.append(icon);
    }
    var iconroot = $.tabulator.opts.iconroot;
    span.text('^v'); icon.attr('src', iconroot+'/sort-updown.gif');
  }

  // append a row with empty cells to the table and assign an id
  function append_newrow_to_table( table, rowid ) {
    var column_names = get_column_names( table );

    var tbody = get_tablebody( table );
    rowindex = tbody.children( 'tr' ).length;

    row = new_row( rowid, rowindex, column_names );
    tbody.append( row );
    return row;
  }


  // insert a row with empty cells to the table
  // newrowid: the id of the new row 
  // rowid: the id of the row after which the new row will be inserted
  function insert_newrowafter_to_table( table, newrowid, rowid ) {

    var column_names = get_column_names( table );

    var tbody = get_tablebody( table );

    rows = tbody.children( 'tr' );
    rowindex = find_row_index( rowid, rows );

    // "after"
    rowindex += 1;

    row = new_row( newrowid, rowindex, column_names );
    tbody.append( row );
    return row;
  }


  // find row given row id and return row index
  function find_row_index( rowid, rows ) {
    for (i = 0; i<rows.length; i++) {
      row = rows[i];
      if (row.attr('rowid') == rowid) return i;
    }
    return undefined;
  }


  // fill a row of cells with given data.
  // descriptors for every columns are given as well.
  function fill_row_with_data( row, datalist, column_descriptors ) {
    
    cells = row.children( 'td' );
    
    for (var i=0; i<datalist.length; i++) {

      cell = $(cells[i]);
      var descriptor = column_descriptors[cell.attr( 'colname' )];
      var datatype = descriptor.datatype;
      var value = datalist[i];
      cell.attr( 'datatype', datatype );
      cell.establish_cell_from_data( value );
      if (descriptor.hidden) cell.hide();
    }

  };


  // find the parent table
  function find_parent_table( element ) {
    return $( element.parents( 'table' )[0] );
  }


  // get column name of a cell
  function get_column_name( cell ) {
    return cell.attr( 'colname' );
  }

  // get column descriptor of a cell
  function get_column_descriptor( cell ) {
    table = find_parent_table( cell );
    colname = get_column_name( cell );
    descriptors = table.data('column_descriptors');
    return descriptors[ colname ];
  }
  

  // enable editing for a cell according to the cell's datatype
  function enable_cell_editing_by_datatype( cell ) {
    var datatype = cell.attr('datatype');
    var handler = eval( "$.fn.enable_cell_editing.handle_" + datatype );
    handler( cell );
  }


  // restore cell from editing status according to the cell's datatype
  function restore_cell_from_editing_by_datatype( cell ) {
    value = cell.cell_value_from_editing_widget( );
    cell.establish_cell_from_data( value );
  }


  // create a new row with empty cells
  function new_row(rowid, rowindex, columnnames) {
    
    // new row
    var tr = $(document.createElement( 'tr' ));
    var n = columnnames.length;

    var odd = rowindex % 2;
    tr.addClass( odd? 'odd':'even' );
    tr.attr( 'rowid', rowid );

    var cell, colname;
    for (var i=0; i<n; i++) {
      
      cell = $( document.createElement( 'td' ) );
      colname = columnnames[i];
      cell.attr( 'colname', colname);

      tr.append(cell);

    }
    
    return tr;
  }

  
  function get_tablehead( table ) {
    var theads = table.children( 'thead' );
    var lastthead = theads[ theads.length - 1 ];
    return $(lastthead);
  }
  
  
  function get_column_names( table ) {
    thead = get_tablehead( table );
    rows = thead.children( 'tr' );
    lastrow = $( rows[ rows.length -1 ] );
    cols = lastrow.children();
    names = [];
    for (i=0; i<cols.length; i++) {
      name = $(cols[i]).attr( 'colname' );
      names.push( name );
    }
    return names;
  }

  function get_tablebody( table ) {
    var tbodys = table.children( 'tbody' );
    var lasttbody = tbodys[ tbodys.length - 1 ];
    return $(lasttbody);
  }

  // find the index of the column for the given column name in the given cells
  function find_column_no( column_name, cells ) {
    for (i=0; i<cells.length; i++) {
      cell = cells[i];
      if ($(cell).attr('colname') == column_name ) return i;
    }
    return undefined;
  }

  // sort given rows by a column. The column name is given.
  function sort_rows_by_col( rows, column_name, column_descriptors, direction ) {

    descriptor = column_descriptors[ column_name ];
    datatype = descriptor.datatype;

    colno = find_column_no( column_name, $( rows[0] ).children() );
    var compare_handler = eval( "$.fn.sort_table_by_col.handle_" + datatype );
    if (compare_handler==undefined) return rows;

    function compare (row1, row2) {
      var cells1 = $(row1).children('td');
      var cells2 = $(row2).children('td');

      var cell1 = $(cells1[colno]);
      var value1 = cell1.extract_data_from_cell();

      var cell2 = $(cells2[colno]);
      var value2 = cell2.extract_data_from_cell();
      
      // ****** shall we assert datatypes are matched? *******
      
      return compare_handler( value1, value2 );
    }

    rows.sort( compare );
    if (direction!=0) rows.reverse();
    return rows;
  }

  // sort given rows by a column. The column name is given.
  // return a list of rows, each row being a tuple of data values.
  function sort_rows_by_col_dataonly( rows, column_name, column_descriptors, direction ) {
    
    // list of rows that are just data
    var datalist = [];
    for (var i=0; i<rows.length; i++) {
      datalist.push($(rows[i]).extract_data_from_row());
    }
    
    var descriptor = column_descriptors[ column_name ];
    var datatype = descriptor.datatype;

    var colno = find_column_no( column_name, $( rows[0] ).children() );
    var compare_handler = eval( "$.fn.sort_table_by_col.handle_" + datatype );
    if (compare_handler==undefined) return datalist;

    function compare (row1, row2) {
      var value1 = row1[colno];
      var value2 = row2[colno];
      
      // ****** shall we assert datatypes are matched? *******
      
      return compare_handler( value1, value2 );
    }

    datalist.sort( compare );
    if (direction!=0) datalist.reverse();
    return datalist;
  }

 }) (jQuery);


// version
// $Id$

// End of file 
