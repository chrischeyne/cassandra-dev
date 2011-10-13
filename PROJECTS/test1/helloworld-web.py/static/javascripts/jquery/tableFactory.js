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


var tableFactory = {};


(function (d, $) {

  // createTable in the given division 
  // id: the  id of the table
  // descriptors: descriptors of columns
  // div: the division in which the table will be created
  d.createTable = function ( id, div, descriptors ) {
    
    // table skeleton
    thetable = make_table_skeleton(id);
    
    // add table to a form
    // form = make_form();
    // form.append( thetable );
    
    // add form to the division
    // div.append( form );
    if (div)
      div.append(thetable);
    
    // contents of table
    // head
    make_table_head( thetable, descriptors );

    return thetable;
  };
  
  function make_form() {
    return $( '<form> </form>' );
  }

  function make_table_skeleton(id) {
    
    table = $( '<table id="' + id +'" border="1"></table>' );
    
    thead = $( '<thead></thead' );
    table.append(thead);
    
    headrow = $( '<tr></tr>' );
    thead.append( headrow );
    
    tbody = $( '<tbody></tbody>' );
    table.append( tbody );
    
    return table;
  }

  
  function add_headcell( name, text, headrow )
  {
    cell = $( '<td colname="' + name + '">' + text + '</td>' );
    headrow.append( cell );
    return cell;
  }
  
  
  function establish_headrow_from_column_descriptors( headrow, descriptors )
  {
    for (var colname in descriptors) {
      descriptor = descriptors[ colname ];
      cell = add_headcell( colname, descriptor.text, headrow );
      if (descriptor.hidden) cell.hide();
    }
  }
  
  
  function make_table_head( thetable, descriptors ) {
    
    thead = $(thetable.children( 'thead' )[0]);
    headrow = $(thead.children( 'tr' )[0]);
    
    establish_headrow_from_column_descriptors( headrow, descriptors );
    thetable.table_setcolumndescriptors( descriptors );
    for (var colname in descriptors) {
      var descriptor = descriptors[colname];
      if (descriptor.sortable) {
	thetable.sortable_column(colname);
      }
    }
  }

 }) (tableFactory, jQuery);


// End of file
