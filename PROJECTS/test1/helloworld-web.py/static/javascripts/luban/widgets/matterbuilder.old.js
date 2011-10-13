// -*- JavaScript -*-
//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
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
  dmp.onmatterbuilder = dmp._onElement;

  // take a list of atoms and generate a "div" that has the scene
  function createScene(atoms) {
	  
	  o3djs.require('o3djs.util');
	  o3djs.require('o3djs.rendergraph');
	  o3djs.require('o3djs.material');
	  o3djs.require('o3djs.primitives');
	  o3djs.require('o3djs.arcball');
	  o3djs.require('o3djs.picking');
	  o3djs.require('o3djs.math');
	  o3djs.require('o3djs.quaternions');

	  //new requires
	  o3djs.require('o3djs.pack');
	  o3djs.require('o3djs.arcball');
	  o3djs.require('o3djs.scene');
	  o3djs.require('o3djs.debug');

	  // global variables
	  var g_o3dElement;
	  var g_client;
	  var g_o3d;
	  var g_math;
	  var g_quaternions;
	  var g_pack;
	  var g_viewInfo;
	  var g_sceneRoot;
	  var g_eyeView;
	  var g_cubeShape;
	  var g_cylinderShape;
	  var g_prismShape;
	  var g_material;
	  var g_aball;
	  var g_thisRot;
	  var g_lastRot;
	  var g_zoomFactor;
	  var g_dragging = false;
	  var g_treeInfo;  // information about the transform graph.
	  var g_statusInfoElem;

	  // Animation globals.
	  var g_flashTimer;
	  var g_moveTimer;
	  var g_moveDuration;
	  var g_oldFlashTimer;

	  // Checkers globals.
	  var g_board;
	  var g_boardSize;
	  var g_boardSquare;
	  var g_boardHeight;
	  var g_pieceHeight;
	  var g_selectedPiece;
	  var g_selectedSquare;
	  var g_player;
	  var g_canJump;

	  //Lattice globals.
	  var symbol;
	  var name;
	  var mass;
	  var sym2no = {};
	  var name2no = {}
	  var symlower=[];
	  var mass2no = {}
	  var color;
	  var color1 = [] // colors scaled to 0-1
	  var rvdw;
	  var radius = rvdw;
	  var rcov;

	  //var tableLattice=['lattice', [[5,0,0],[-1,5,0],[0,0,5]]];
	  var tableLattice = [[5,0,0],[-1,5,0],[0,0,5]];
	  var tableAtom = [['Fe', [0.5,0.5,0.5]], ['C', [2.5,2.5,2.5]]];
	  var tableBond = [ [[0.5,0.5,0.5],[2.5,2.5,2.5]]];
	  var sizeX=1;//expand of the supercell along X
	  var sizeY=1;//expand of the supercell along Y
	  var sizeZ=1;//expand of the supercell along Z
	  var latticeParameterX;
	  var latticeParameterY;
	  var latticeParameterZ;

	  var g_lattice; //table with all the informations of the lattice
	  var g_selectedAtom=[];
	  var g_selectedBond=[];

	  //functions to initialize ------------------------------------------------------------------------------------
	  /**
	   * Creates the client area.
	   */
	  function initClient() {
	    window.g_finished = false;  // for selenium testing.

	    // Runs the sample in V8. Comment out this line to run it in the browser
	    // JavaScript engine, for example if you want to debug it.
	    //o3djs.util.setMainEngine(o3djs.util.Engine.V8);

	    o3djs.util.makeClients(main);
	  }

	  /**
	   * Initializes global variables, positions camera, draws the 3D chart.
	   * @param {Array} clientElements Array of o3d object elements.
	   */
	  function main(clientElements) {
	  	// Init global variables.
	  	initGlobals(clientElements);

	  	// Set up the view and projection transformations.
	  	initContext();

	  	// Add the checkers board to the transform hierarchy.
	  	//createCheckersBoard();
	  	  
	  	//lattice environment
	  	
	  	//drawlattice(tableLattice, tableAtoms, tableBonds, sizeX, sizeY, sizeZ);
	  	createLattice(sizeX, sizeY, sizeZ, tableLattice, tableAtom, tableBond)
	  		  
	  	// Register mouse events handlers
	  	o3djs.event.addEventListener(g_o3dElement, 'mousedown', startDragging);
	  	o3djs.event.addEventListener(g_o3dElement, 'mousemove', drag);
	  	o3djs.event.addEventListener(g_o3dElement, 'mouseup', stopDragging);
	  	o3djs.event.addEventListener(g_o3dElement, 'wheel', scrollMe);

	  	// Set the rendering callback
	  	g_client.setRenderCallback(onrender);

	  	window.g_finished = true;  // for selenium testing.
	  }

	  /**
	   * Initializes global variables and libraries.
	   */
	  function initGlobals(clientElements) {
	    // init o3d globals.
	    g_o3dElement = clientElements[0];
	    window.g_client = g_client = g_o3dElement.client;
	    g_o3d = g_o3dElement.o3d;
	    g_math = o3djs.math;
	    g_quaternions = o3djs.quaternions;

	    // Create an arcball.
	    g_aball = o3djs.arcball.create(g_client.width, g_client.height);

	    // Create a pack to manage the objects created.
	    g_pack = g_client.createPack();

	    // Create a transform node to act as the 'root' of the scene.
	    // Attach it to the root of the transform graph.
	    g_sceneRoot = g_pack.createObject('Transform');
	    g_sceneRoot.parent = g_client.root;

	    // Create the render graph for the view.
	    var clearColor = [.98, .98, .98, 1];
	    g_viewInfo = o3djs.rendergraph.createBasicView(
	      g_pack,
	      g_client.root,
	      g_client.renderGraphRoot,
	      clearColor);

	    // Create a material for the objects rendered.
	    g_material = o3djs.material.createBasicMaterial(
	        g_pack,
	        g_viewInfo,
	        [1, 1, 1, 1]);

	    // Initialize checkers piece and square data.
	    g_boardSize = 8;
	    g_boardSquare = 10;
	    g_boardHeight = g_boardSquare / 5;
	    g_pieceHeight = g_boardHeight * 0.75;
	    g_selectedPiece = null;
	    g_selectedSquare = null;

	    // Create a cube shape for the board squares.
	    g_cubeShape = o3djs.primitives.createCube(
	        g_pack,
	        g_material,
	        1);

	    // Create a cylinder shape for the checkers pieces.
	    g_cylinderShape = o3djs.primitives.createCylinder(
	        g_pack,
	        g_material,
	        g_boardSquare / 2 - 1,   // Radius.
	        g_pieceHeight,           // Depth.
	        100,                     // Number of subdivisions.
	        1);

	    // use an extruded polygon to create a 'crown' for the king piece.
	    var polygon = [[0, 0], [1, 0], [1.5, 1.5], [0.5, 0.5],
	                   [0, 2], [-0.5, 0.5], [-1.5, 1.5], [-1, 0]];

	    // use the 'prism' primitive for the crown.
	    g_prismShape = o3djs.primitives.createPrism(
	        g_pack,
	        g_material,
	        polygon,     // The profile polygon to be extruded.
	        1);          // The depth of the extrusion.

	    // Get the status element.
	    g_statusInfoElem = o3djs.util.getElementById('statusInfo');

	    // Initialize player data.
	    g_player = 1;  // red player starts first.
	    g_canJump = false;

	    // Initialize various animation globals.
	    g_flashTimer = 0;
	    g_moveTimer = 0;
	    g_moveDuration = 1.3;
	    g_oldFlashTimer = 0;
	    
	    //initialize lattice variables
	    initlatticeVariables();
	    
	  }

	  /**
	   * Initialize the original view of the scene.
	   */
	  function initContext() {
	    g_eyeView = [-5, 120, 100];
	    g_zoomFactor = 1.03;
	    g_dragging = false;
	    g_sceneRoot.identity();
	    g_lastRot = g_math.matrix4.identity();
	    g_thisRot = g_math.matrix4.identity();

	    // Set up a perspective transformation for the projection.
	    g_viewInfo.drawContext.projection = g_math.matrix4.perspective(
	        Math.PI * 40 / 180,    // 30 degree frustum.
	        g_o3dElement.clientWidth / g_o3dElement.clientHeight,  // Aspect ratio.
	        1,                     // Near plane.
	        10000);                // Far plane.

	    // Set up our view transformation to look towards the axes origin.
	    g_viewInfo.drawContext.view = g_math.matrix4.lookAt(
	        g_eyeView,       // eye
	        [0, 0, 0],       // target
	        [0, 1, 0]);      // up
	  }

	  /**
	   *this function is used to initialize the variables of the lattice
	   */
	  function initlatticeVariables(){
	  	symbol = ['X','H', 'He','Li','Be','B', 'C', 'N', 'O', 'F' ,'Ne','Na','Mg','Al','Si','P', 'S', 'Cl','Ar','K','Ca','Sc','Ti','V', 'Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr','Rb','Sr','Y', 'Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I', 'Xe','Cs','Ba','La','Ce','Pr','Nd','Pm','Sm','Eu','Gd','Tb','Dy','Ho','Er','Tm','Yb','Lu','Hf','Ta','W', 'Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po','At','Rn','Fr','Ra','Ac','Th','Pa','U', 'Np','Pu','Am','Cm','Bk','Cf','Es','Fm','Md','No','Lr','Rf','Db','Sg','Bh','Hs','Mt','Ds','Rg'];
	  	name = ['dummy','hydrogen','helium','lithium','berylium','boron','carbon','nitrogen','oxygen','fluorine','neon','sodium','magnesium','aluminum','silicon','phosphorus','sulphur','chlorine','argon','potassium','calcium','scandium','titanium','vanadium','chromium','manganese','iron','cobalt','nickel','copper','zinc','gallium','germanium','arsenic','selenium','bromine','krypton','rubidium','strontium','yttrium', 'zirconium','niobium','molybdenum','tecnitium','rubidium','rhodium','palladium','silver','cadmium','indium','tin','antimony','tellurium','iodine','xenon','caesium','barium','lanthanum','cerium','praseodymium','neodymium','promethium','samarium','europium','gadolinium','terbium','dysprosium','holmium','erbium','thulium','ytterbium','lutetium','hafnium','tantalum','tungsten','rhenium','osmium','iridium','platinum','gold','mercury','thallium','lead','bismuth','polonium','astatine','radon','francium','radium','actinium','thorium','protactinium','uranium','neptunium','plutonium','americium','curium','berkelium','californium','einsteinium','fermium','mendelvium','nobelium','lawrencium','rutherfordium','dubnium','seaborgium','bohrium','hassium','meitnerium','darmstadtium','roentgenium'];
	  	mass = [0.00,1.0008, 4.0026,6.941,9.0122,10.811,12.011,14.007,15.999,18,998,20.179,22.990,24.305,26.982,28.086,30.974,32.066,35.453,39.948,39.098, 40.078,44.9559, 47.867, 50.9415, 51.9961, 54.938, 55.845, 58.9332, 58.6934, 63.546,65.39,    69.723, 72.61, 74.9216, 78.96, 79.904, 83.80,    85.4678, 87.62,    88.90686, 91.224, 92.90638, 95.94, 98, 101.07,    102.90550, 106.42, 107.8682, 112.411,    114.818, 118.710, 121.760, 127.60, 126.90447, 131.29];
	  	
	  	for( var i=0; i<symbol.length; i++){
	  		sym2no[symbol[i]] = i ;
	  		sym2no[symbol[i].toLowerCase()] = i ;
	  	}
	  	
	  	for(i=0; i<name.length; i++){
	  		name2no[name[i]] = i;
	  		name2no[name[i].toLowerCase()] = i;
	  	}
	  	
	  	for(i=0; i<symbol.length; i++){
	  		symlower[i]=symbol[i].toLowerCase();
	  	}
	  	
	  	for(i=0; i<mass.length; i++){
	  		mass2no[Math.round(mass[i])] = i;
	  	}
	  	
	  	color = [
	          [0,0,0],        // dummy
	          [250,235,215],  // H,  1 
	          [255,192,203],  // He, 2 
	          [178,34,34],    // Li, 3
	          [34,139,34],    // Be, 4
	          [0,255,0],      // B,  5
	          [112,128,144],  // C,  6
	          [0,191,255],    // N,  7
	          [255,0,0],      // O,  8
	          [218,165,32],   // F,  9
	          [255,105,180],  // Ne, 10
	          [0,0,255],      // Na, 11
	          [34,139, 34],   // Mg, 12
	          [190,190,190],  // Al, 13
	          [218,165,32],   // Si, 14
	          [255,165,0],    // P,  15
	          [255,255,0],    // S,  16
	          [0,255,0],      // Cl, 17
	          [255,192,203],  // Ar, 18
	          [255,20,147],   // K,  19
	          [128,128,128],  // Ca, 20
	          [190,190,190],  // Sc, 21
	          [190,190,190],  // Ti, 22
	          [190,190,190],  // V,  23
	          [190,190,190],  // Cr, 24
	          [190,190,190],  // Mn, 25
	          [255,165,0],    // Fe, 26
	          [165,42,42],    // Co, 27
	          [165,42,42],    // Ni, 28
	          [165,42,42],    // Cu, 29
	          [165,42,42],    // Zn, 30
	          [165,42,42],    // Ga, 31
	          [85,107,47],    // Ge, 32
	          [253,245,230],  // As, 33
	          [152,251,152],  // Se, 34
	          [165,42,42],    // Br, 35
	          [50,205,50],    // Kr, 36
	          [165,42,42],    // Rb, 37
	          [190,190,190],  // Sr, 38
	          [190,190,190],  // Y,  39
	          [190,190,190],  // Zr, 40
	          [190,190,190],  // Nb, 41
	          [255,127,80],   // Mo, 42
	          [190,190,190],  // Tc, 43
	          [190,190,190],  // Ru, 44
	          [190,190,190],  // Rh, 45
	          [190,190,190],  // Pd, 46
	          [190,190,190],  // Ag, 47
	          [255,140,0],    // Cd, 48
	          [190,190,190],  // In, 49
	          [190,190,190],  // Sn, 50
	          [190,190,190],  // Sb, 51
	          [190,190,190],  // Te, 52
	          [160,32,240],   // I,  53
	          [255,105,180],  // Xe, 54
	          [165,42,42],    // Cs, 55
	          [190,190,190],  // Ba, 56
	          [190,190,190],  // La, 57
	          [190,190,190],  // Ce, 58
	          [190,190,190],  // Pr, 59
	          [190,190,190],  // Nd, 60
	          [190,190,190],  // Pm, 61
	          [190,190,190],  // Sm, 62
	          [190,190,190],  // Eu, 63
	          [190,190,190],  // Gd, 64
	          [190,190,190],  // Tb, 65
	          [190,190,190],  // Dy, 66
	          [190,190,190],  // Ho, 67
	          [190,190,190],  // Er, 68
	          [190,190,190],  // Tm, 69
	          [190,190,190],  // Yb, 70
	          [190,190,190],  // Lu, 71
	          [190,190,190],  // Hf, 72
	          [190,190,190],  // Ta, 73
	          [64,224,208],   // W,  74
	          [190,190,190],  // Re, 75
	          [190,190,190],  // Os, 76
	          [190,190,190],  // Ir, 77
	          [190,190,190],  // Pt, 78
	          [255,215,0],    // Au, 79
	          [190,190,190],  // Hg, 80
	          [190,190,190],  // Tl, 81
	          [190,190,190],  // Pb, 82
	          [255,181,197],  // Bi, 83
	          [190,190,190],  // Po, 84
	          [190,190,190],  // At, 85
	          [190,190,190],  // Rn, 86
	          [190,190,190],  // Fr, 87
	          [190,190,190],  // Ra, 88
	          [190,190,190],  // Ac, 89
	          [190,190,190],  // Th, 90
	          [190,190,190],  // Pa, 91
	          [90,90,90],     // U,  92
	          [190,190,190],  // Np, 93
	          [190,190,190],  // Pu, 94
	          [190,190,190],  // Am, 95
	          [190,190,190],  // Cm, 96
	          [190,190,190],  // Bk, 97
	          [190,190,190],  // Cf, 98
	          [190,190,190],  // Es, 99
	          [190,190,190],  // Fm, 100
	          [190,190,190],  // Md, 101
	          [190,190,190],  // No, 102
	          [190,190,190],  // Lr, 103
	          [190,190,190],  // Rf, 104
	          [190,190,190],  // Db, 105
	          [190,190,190],  // Sg, 106
	          [190,190,190],  // Bh, 107
	          [190,190,190],  // Hs, 108
	          [190,190,190],  // Mt, 109
	          [190,190,190],  // Ds, 110
	          [190,190,190]];  // Rg, 111
	  	
	  	for(i=0; i<color.length; i++){
	  		color[i]=[color[i][0]/255., color[i][1]/255., color[i][2]/255.];
	  	}

	  	rvdw = [
	          1.0000, // dummy
	          1.2000, // H,  1 
	          1.4000, // He, 2 
	          1.8200, // Li, 3
	          1.3725, // Be, 4
	          0.7950, // B,  5
	          1.7000, // C,  6
	          1.5500, // N,  7
	          1.5200, // O,  8
	          1.4700, // F,  9
	          1.5400, // Ne, 10
	          2.2700, // Na, 11
	          1.7300, // Mg, 12
	          1.7000, // Al, 13
	          2.1000, // Si, 14
	          1.8000, // P,  15
	          1.8000, // S,  16
	          1.7500, // Cl, 17
	          1.8800, // Ar, 18
	          2.7500, // K,  19
	          2.4500, // Ca, 20
	          1.3700, // Sc, 21
	          1.3700, // Ti, 22
	          1.3700, // V,  23
	          1.3700, // Cr, 24
	          1.3700, // Mn, 25
	          1.4560, // Fe, 26
	          0.8800, // Co, 27  
	          0.6900, // Ni, 28
	          0.7200, // Cu, 29
	          0.7400, // Zn, 30
	          1.3700, // Ga, 31
	          1.9500, // Ge, 32
	          1.8500, // As, 33
	          1.9000, // Se, 34  
	          1.8500, // Br, 35
	          2.0200, // Kr, 36
	          1.5800, // Rb, 37
	          2.1510, // Sr, 38
	          1.8010, // Y,  39
	          1.6020, // Zr, 40
	          1.4680, // Nb, 41  
	          1.5260, // Mo, 42
	          1.3600, // Tc, 43
	          1.3390, // Ru, 44
	          1.3450, // Rh, 45
	          1.3760, // Pd, 46
	          1.2700, // Ag, 47
	          1.4240, // Cd, 48  
	          1.6630, // In, 49
	          2.1000, // Sn, 50
	          2.0500, // Sb, 51
	          2.0600, // Te, 52
	          1.9800, // I,  53
	          2.0000, // Xe, 54
	          1.8400, // Cs, 55  
	          2.2430, // Ba, 56
	          1.8770, // La, 57
	          null,   // Ce, 58
	          null,   // Pr, 59
	          null,   // Nd, 60
	          null,   // Pm, 61
	          null,   // Sm, 62
	          null,   // Eu, 63
	          null,   // Gd, 64
	          null,   // Tb, 65
	          null,   // Dy, 66
	          null,   // Ho, 67
	          null,   // Er, 68
	          null,   // Tm, 69
	          null,   // Yb, 70
	          2.1700, // Lu, 71
	          1.5800, // Hf, 72
	          1.4670, // Ta, 73
	          1.5340, // W,  74
	          1.3750, // Re, 75
	          1.3530, // Os, 76  
	          1.3570, // Ir, 77
	          1.7500, // Pt, 78
	          1.6600, // Au, 79
	          1.5500, // Hg, 80
	          1.9600, // Tl, 81
	          2.0200, // Pb, 82
	          2.1500];// Bi, 83
	                  // Po, 84
	                  // At, 85
	                  // Rn, 86
	                  // Fr, 87
	                  // Ra, 88
	                  // Ac, 89
	                  // Th, 90
	                  // Pa, 91
	                  // U,  92
	                  // Np, 93
	                  // Pu, 94
	                  // Am, 95
	                  // Cm, 96
	                  // Bk, 97
	                  // Cf, 98
	                  // Es, 99
	                  // Fm, 100
	                  // Md, 101
	                  // No, 102
	                  // Lr, 103
	                  // Rf, 104
	                  // Db, 105
	                  // Sg, 106
	                  // Bh, 107
	                  // Hs, 108
	                  // Mt, 109
	                  // Ds, 110
	                  // Rg, 111
	  	rcov = [null, 0.32, 0.93, 1.23, 0.90, 0.82, 0.77, 0.75, 0.73, 0.72, 0.71,
	          1.54, 1.36, 1.18, 1.11, 1.06, 1.02, 0.99, 0.98, 2.03, 1.74, 1.44,
	          1.32, 1.22, 1.18, 1.17, 1.17, 1.16, 1.15, 1.17, 1.25, 1.26, 1.22,
	          1.20, 1.16, 1.14, 1.12, 2.16, 1.91, 1.62, 1.45, 1.34, 1.30, 1.27,
	          1.25, 1.25, 1.28, 1.34, 1.48, 1.44, 1.41, 1.40, 1.36, 1.33, 1.31,
	          2.35, 1.98, 1.69, null, null, null, null, null, null, null, null,
	          null, null, null, null, null, 1.60, 1.44, 1.34, 1.30, 1.28, 1.26,
	          1.27, 1.30, 1.34, 1.49, 1.48, 1.47, 1.46];
	  		
	  		
	  	latticeParameterX=Math.sqrt(Math.pow(tableLattice[0][0],2)+Math.pow(tableLattice[0][1],2)+Math.pow(tableLattice[0][2],2));
	  	latticeParameterY=Math.sqrt(Math.pow(tableLattice[1][0],2)+Math.pow(tableLattice[1][1],2)+Math.pow(tableLattice[1][2],2));
	  	latticeParameterZ=Math.sqrt(Math.pow(tableLattice[2][0],2)+Math.pow(tableLattice[2][1],2)+Math.pow(tableLattice[2][2],2));
	  }
	  //--------------------------------------------------------------------------------------------------------------


	  //converted
	  /**
	   * Creates a cellInfo object to hold board information.
	   * @private
	   * @constructor
	   * @param {number} x X coordinate of the cell.
	   * @param {number} y Y coordinate of the cell.
	   * @param {number} z Z coordinate of the cell.
	   */
	  function CellInfo(x,y,z){
	  	this.x=x;
	  	this.y=y;
	  	this.z=z;
	  	this.tableAtomCell=[];
	  	this.tableBondCell=[];
	  	this.tableAtomTransform=[];
	  	this.tableBondTransform=[];
	  }


	  /**
	   * Creates the checkers board.
	   */
	  function createLattice(sizeX, sizeY, sizeZ, tableLattice, tableAtom, tableBond) {
	  	g_lattice = [];
	  	
	  	//create the atoms and the bonds inside each unitcell
	  	for (var indexX = 0; indexX < sizeX; indexX++) {//duplicate the cell along the X axis
	  		g_lattice[indexX] = [];
	  		for (var indexY = 0; indexY < sizeY; indexY++) {//duplicate the cell along the Y axis
	  			g_lattice[indexX][indexY]=[];
	  			for(var indexZ=0; indexZ<sizeZ; indexZ++){
	  				//create the info in the lattice table
	  				g_lattice[indexX][indexY][indexZ] = new CellInfo(indexX, indexY, indexZ);
	  				
	  				//create the atoms inside the cell
	  				for(var indexTableAtom=0; indexTableAtom<tableAtom.length; indexTableAtom++){
	  					//create the transform for the atom
	  					var atom=g_pack.createObject('Transform');
	  					atom.parent=g_sceneRoot;
	  															
	  					atom.addShape(createSphereShapeBySymbol(tableAtom[indexTableAtom][0]));
	  					atom.cull = true;
	  					
	  					//translate the atom relatively to the position of the cell
	  					var atomTranslation=translation(tableAtom[indexTableAtom][1], tableLattice[0], indexX);//translation along X with the X vector of the lattice
	  					atomTranslation=translation(atomTranslation, tableLattice[1], indexY);//translation along Y with the Y vector of the lattice
	  					atomTranslation=translation(atomTranslation, tableLattice[2], indexZ);//translation along Z with the Z vector of the lattice
	  								
	  					//translate the atom realtively to the center of the supercell
	  					atomTranslation=translation(atomTranslation, tableLattice[0], -sizeX/2);
	  					atomTranslation=translation(atomTranslation, tableLattice[1], -sizeY/2);
	  					atomTranslation=translation(atomTranslation, tableLattice[2], -sizeZ/2);
	  					
	  					//translation for the transform
	  					atom.translate(atomTranslation);

	  					//create an additionnal parameter for blinking
	  					var indexOfElement=sym2no[tableAtom[indexTableAtom][0]];
	  					atom.createParam('diffuse', 'ParamFloat4').value = color[indexOfElement];
	  					
	  					// add this atom and its info to the lattice.
	  					g_lattice[indexX][indexY][indexZ].tableAtomCell.push(tableAtom[indexTableAtom]);
	  					g_lattice[indexX][indexY][indexZ].tableAtomTransform.push(atom);
	  				
	  				}
	  				
	  				//create the bonds inside the cell
	  				for(var indexTableBond=0; indexTableBond<tableBond.length; indexTableBond++){
	  					//create the transform for the bond
	  					var bond=g_pack.createObject('Transform');
	  					bond.parent=g_sceneRoot;
	  					bond.addShape(createBondShape(tableBond[indexTableBond][0],tableBond[indexTableBond][1]) );
	  					bond.cull = true;
	  					
	  					//translate the bond relatively to the middle of the two points
	  					var bondTranslation=getTranslation(tableBond[indexTableBond][0],tableBond[indexTableBond][1]);
	  					
	  					//translate the bond relatively to the position of the cell
	  					bondTranslation=translation(bondTranslation, tableLattice[0], indexX);//translation along X with the X vector of the lattice
	  					bondTranslation=translation(bondTranslation, tableLattice[1], indexY);//translation along Y with the Y vector of the lattice
	  					bondTranslation=translation(bondTranslation, tableLattice[2], indexZ);//translation along Z with the Z vector of the lattice
	  					
	  					//translate the bond realtively to the cneter of the supercell
	  					bondTranslation=translation(bondTranslation, tableLattice[0], -sizeX/2);
	  					bondTranslation=translation(bondTranslation, tableLattice[1], -sizeY/2);
	  					bondTranslation=translation(bondTranslation, tableLattice[2], -sizeZ/2);
	  					
	  					//translate for the transform
	  					bond.translate(bondTranslation);
	  					
	  					//rotate the bond
	  					var bondRotation=[getAlpha(tableBond[indexTableBond][0],tableBond[indexTableBond][1]), getBeta(tableBond[indexTableBond][0],tableBond[indexTableBond][1]), 0];
	  					
	  					//rotate the transform
	  					bond.rotateZYX(bondRotation);
	  					
	  					//create an additionnal parameter for the blinking
	  					bond.createParam('diffuse', 'ParamFloat4').value = [0,0,1,1];
	  														
	  					// add this atom and its info to the lattice.
	  					g_lattice[indexX][indexY][indexZ].tableBondCell.push(tableBond[indexTableBond]);
	  					g_lattice[indexX][indexY][indexZ].tableBondTransform.push(bond);
	  					
	  				}
	  				
	  			}
	  		}
	  	}
	  	
	  	//create the supercell lattice
	  	var transformTableSupercell=createTransformTableSupercell(tableLattice, sizeX, sizeY, sizeZ);
	  	for(var indexTableSupercell=0; indexTableSupercell<transformTableSupercell.length; indexTableSupercell++){
	  		var line=g_pack.createObject('Transform');
	  		line.parent=g_sceneRoot;
	  		line.addShape( transformTableSupercell[indexTableSupercell].shape );
	  		line.cull = true;
	  	
	  	}
	  	
	  	
	  	// Update our tree info.
	  	updateTreeInfo();
	  	
	  }

	  /**
	   * Checks if a piece has become a 'king' piece and updates it.
	   *
	   * @param {number} x X coordinate on the checkers board.
	   * @param {number} y Y coordinate on the checkers board.
	   */
	  function checkAndUpdateKing(x, y) {
	    // if the piece is not on the king row, nothing to do.
	    if ( y > 0 && y < g_boardSize - 1 ) return;

	    // ignore if no piece or the piece is already king
	    var selSquare = g_board[x][y];
	    if (!selSquare.piece || selSquare.king) return;

	    // change the king piece color.
	    selSquare.king = true;

	    // create the crown shape.
	    var crown = g_pack.createObject('Transform');
	    crown.parent = selSquare.piece;
	    crown.addShape(g_prismShape);
	    var crownSize = g_pieceHeight;
	    crown.scale(crownSize, crownSize, crownSize);
	    crown.translate(0, g_pieceHeight / 2, 0);
	    crown.createParam('diffuse', 'ParamFloat4').value = [1, 1, 0, 0];
	  }

	  /**
	   * Updates the transform tree info.
	   */
	  function updateTreeInfo() {
	    if (!g_treeInfo) {
	      g_treeInfo = o3djs.picking.createTransformInfo(g_client.root, null);
	    }
	    g_treeInfo.update();
	  }

	  //converted
	  function detectSelectionCell(e){
	  	var worldRay = o3djs.picking.clientPositionToWorldRay(e.x,
	  														e.y,
	                                                          g_viewInfo.drawContext,
	                                                          g_client.width,
	                                                          g_client.height);
	  	// check if we picked any objects.
	  	var pickInfo = g_treeInfo.pick(worldRay);
	  	if (pickInfo) {
	  		// get the parent transform of this object.
	  		var pickTrans = pickInfo.shapeInfo.parent.transform;

	  		//find if the piece selected exists
	  		for (var indexX=0; indexX < g_lattice.length; indexX++) {
	  			for (var indexY=0; indexY < g_lattice[indexX].length; indexY++) {
	  				for(var indexZ=0; indexZ < g_lattice[indexX][indexY].length; indexZ++){
	  					
	  					var tableAtomTrans=g_lattice[indexX][indexY][indexZ].tableAtomTransform;
	  					
	  					for(var indexTableAtomTrans=0; indexTableAtomTrans<tableAtomTrans.length; indexTableAtomTrans++){
	  						if(pickTrans==tableAtomTrans[indexTableAtomTrans]){
	  							SelectAtom(indexX,indexY,indexZ,indexTableAtomTrans);
	  							return;
	  						
	  						}
	  					}
	  					
	  					var tableBondTrans=g_lattice[indexX][indexY][indexZ].tableBondTransform;
	  					
	  					for(var indexTableBondTrans=0; indexTableBondTrans<tableBondTrans.length; indexTableAtomTrans++){
	  						if(pickTrans==tableBondTrans[indexTableBondTrans]){
	  							SelectBond(indexX,indexY,indexZ,indexTableBondTrans);
	  							return;
	  						
	  						}
	  					}
	  					
	  				}
	  			}
	  		}
	  	}
	  }

	  //converted
	  function SelectAtom(x,y,z,index){
	  	g_selectedAtom.push([g_lattice[x][y][z].tableAtomTransform[index], g_lattice[x][y][z].tableAtomCell[index]]);//we store the transform and the information about the atom in the table of selected Atoms
	  	var atomSymbol=g_lattice[x][y][z].tableAtomCell[index][0];
	  	//update status
	  	updateStatus('Selected '+'atom'+':'+atomSymbol+' at ('+x+','+y+','+z+')');
	  }

	  //converted
	  function SelectBond(x,y,z, index){
	  	g_selectedBond.push([g_lattice[x][y][z].tableBondTransform[index],g_lattice[x][y][z].tableBondCell[index]]);////we store the transform and the information about the atom in the table of selected Atoms
	  		
	  	var point1=g_lattice[x][y][z].tableBondCell[index][0];
	  	var point2=g_lattice[x][y][z].tableBondCell[index][1];
	  	updateStatus('Selected '+'bond'+': ['+point1+' , '+point2+' ]');
	  }

	  /**
	   * Return the color for the given piece type.
	   *
	   * @param {number} type Type of the checkers piece.
	   * @return {Array} Array representing the color.
	   */
	  function getPieceColor(type) {
	    return (type == 1) ? [1, 0.15, 0.15, 1] : [1, 1, 1, 1];
	  }

	  //must be converted
	  /**
	   * Called every frame.
	   * @param {o3d.RenderEvent} renderEvent Rendering Information.
	   */
	  function onrender(renderEvent) {
	  	g_flashTimer += renderEvent.elapsedTime;
	  	g_flashTimer = g_flashTimer % 0.5;
	  	
	  	if(g_selectedAtom.length>0){
	  		for(var indexAtomSelectedTable=0; indexAtomSelectedTable<g_selectedAtom.length; indexAtomSelectedTable++){
	  			var indexOfElement=sym2no[g_selectedAtom[indexAtomSelectedTable][1][0]];
	  			var origColorAtom = color[indexOfElement];
	  			// flash highlight the selected piece as long as selected.
	  			if (g_oldFlashTimer > g_flashTimer ) {
	  				g_selectedAtom[indexAtomSelectedTable][0].getParam('diffuse').value = [0.6, 1, 1, 1];
	  			}
	  			else if (g_flashTimer >= 0.25 && g_oldFlashTimer < 0.25) {
	  				g_selectedAtom[indexAtomSelectedTable][0].getParam('diffuse').value = origColorAtom;
	  			}
	  		}
	  	}
	  	
	  	if(g_selectedBond.length>0){
	  		for(var indexBondSelectedTable=0; indexBondSelectedTable<g_selectedBond.length; indexBondSelectedTable++){
	  			var origColorBond = [0,0,1,1];
	  			// flash highlight the selected piece as long as selected.
	  			if (g_oldFlashTimer > g_flashTimer ) {
	  				g_selectedBond[indexBondSelectedTable][0].getParam('diffuse').value = [0.6, 1, 1, 1];
	  			}
	  			else if (g_flashTimer >= 0.25 && g_oldFlashTimer < 0.25) {
	  				g_selectedBond[indexBondSelectedTable][0].getParam('diffuse').value = origColorBond;
	  			}
	  		}
	  	}
	  	
	    
	    g_oldFlashTimer = g_flashTimer;
	  }



	  //functions for building the lattice----------------------------------------------------
	  //functions to draw the lattice
	  function drawlattice(tableLattice, tableAtoms, tableBonds, sizeX, sizeY, sizeZ){

	  	//creation of the group transform--------------------------------------------------------------------
	  	g_pack = g_client.createPack();

	  	//creation of the lattice shapes---------------------------------------------------------------------
	  	
	  	//addition of the atoms to the display
	  	var transformTableElements=createTransformTableForlattice(tableAtoms);
	  	for (var indexTableElements = 0; indexTableElements < transformTableElements.length; ++indexTableElements) {
	  		var transformEle = g_pack.createObject('Transform');
	  		transformEle.parent = g_sceneRoot;
	  		// Turn on culling
	  		transformEle.cull = true;
	  		transformEle.addShape(transformTableElements[indexTableElements].shape);
	  		//transform.boundingBox = atomSphere.boundingBox;
	  		transformEle.translate(transformTableElements[indexTableElements].translation);
	  	}
	  	
	  	//addition of the bonds to the display
	  	var transformTableBonds=createTransformTableBonds(tableBonds);
	  	for (var indexTableBonds = 0; indexTableBonds < transformTableBonds.length; ++indexTableBonds) {
	  		var transformBonds = g_pack.createObject('Transform');
	  		transformBonds.parent = g_sceneRoot;
	  		// Turn on culling
	  		transformBonds.cull = true;
	  		
	  		transformBonds.addShape(transformTableBonds[indexTableBonds].shape);
	  		//transform.boundingBox = atomSphere.boundingBox;
	  		transformBonds.translate(transformTableBonds[indexTableBonds].translation);
	  		transformBonds.rotateZYX(transformTableBonds[indexTableBonds].rotation);
	  	}
	  	
	  	//addition of the supercell to the display
	  	var transformTableSupercell=createTransformTableSupercell(tableLattice, sizeX, sizeY, sizeZ);
	  	
	  	for (var indexTableSupercell = 0; indexTableSupercell < transformTableSupercell.length; ++indexTableSupercell) {
	  		var transformSupercell = g_pack.createObject('Transform');
	  		transformSupercell.parent = g_sceneRoot;
	  		// Turn on culling
	  		transformSupercell.cull = true;
	  		transformSupercell.addShape(transformTableSupercell[indexTableSupercell].shape);
	  	}
	  	updateTreeInfo();
	  }

	  //new graphics functions
	  /**
	   * Creates a material based on the given single color.
	   * @param {!o3djs.math.Vector4} baseColor A 4-component vector with
	   *     the R,G,B, and A components of a color.
	   * @return {!o3d.Material} A phong material whose overall pigment is
	   *     baseColor.
	   */
	  function createMaterial(baseColor) {
	    // Create a new, empty Material object.
	    return o3djs.material.createBasicMaterial(g_pack, g_viewInfo, baseColor);
	  }

	  //functions to create the atoms for the lattice
	  /**
	   *@param string : symbol of the chemical element
	   *this function returns the sphere shape associated with this element
	   */
	  function createSphereShapeBySymbol(symbol){
	  	var indexOfElement=sym2no[symbol];
	  	var colorOfElement=color[indexOfElement];
	  	colorOfElement[3]=1;
	  	var radiusOfElement=rvdw[indexOfElement];
	  	
	  	var sphere = o3djs.primitives.createSphere(g_pack,
	  												createMaterial(colorOfElement),
	  												radiusOfElement,   // Radius of the sphere.
	  												30,    // Number of meridians.
	  												20);    // Number of parallels.
	  	return sphere;
	  }

	  /**
	   * @param example: first is the symbol of the chemical element, secondly is the position in the lattice
	   * [ ['Fe',[0.5,0.5,0.5]] , ['Fe', [0.3,0.4,0.3]] ]
	   * this function returns a transformTable with the different shapes for the elements of the lattice
	   */
	  function createTransformTableForlattice(tableAtom){
	  	var transformTable = [];
	  	
	  	for( var i=0; i<tableAtom.length; i++){
	  		var symbolEle=tableAtom[i][0];
	  		var sphereShape=createSphereShapeBySymbol(symbolEle);
	  		var elementPosition=tableAtom[i][1];
	  		transformTable[i]={shape: sphereShape, translation: elementPosition};
	  	}
	  	
	  	return transformTable;
	  }

	  /**
	   *@param example: first is the symbol of the chemical element, secondly is the position in the lattice
	   * [ ['Fe',[0.5,0.5,0.5]] , ['Fe', [0.3,0.4,0.3]] ]
	   * this function displays the elements and the bonds of the lattice
	   */
	  function displayLatticeElement(tableAtom){
	  	//elements	
	  	var transformTableElements=createTransformTableForlattice(tableAtom);
	  		
	  	for (var tt = 0; tt < transformTableElements.length; ++tt) {
	  		var transformEle = g_pack.createObject('Transform');
	  		transformEle.addShape(transformTableElements[tt].shape);
	  		transformEle.translate(transformTableElements[tt].translation);
	  		transformEle.parent = g_client.root;
	  	}
	  }

	  //functions needed to create bonds for the lattice
	  /**
	   *@param a=[.,.,.], b=[.,.,.] are the limits of the bonds
	   *This function is used to calculate the lengh of the bond between two points
	   */
	  function getLengthBond(a,b){
	  	var length=Math.sqrt(Math.pow((a[0]-b[0]),2)+Math.pow((a[1]-b[1]),2)+Math.pow((a[2]-b[2]),2));
	  	return length;	
	  }

	  /**
	   *@param a=[.,.,.], b=[.,.,.] are the limits of the bonds
	   *this function is used to calculate the translation needed to place the bond
	   */
	  function getTranslation(a,b){
	  	var translation=[ (b[0]+a[0])/2, (b[1]+a[1])/2, (b[2]+a[2])/2 ];
	  	return translation;
	  }

	  /**
	   *@param a=[.,.,.], b=[.,.,.] are the limits of the bonds
	   *this function is used to calculate the angle alpha (around the X axis) for the rotation of the bond
	   */
	  function getAlpha(a,b){
	  	var normYZ=Math.sqrt( Math.pow( b[1]-a[1],2)+Math.pow( b[2]-a[2],2) );
	  	var normXZ=Math.sqrt( Math.pow( b[0]-a[0],2)+Math.pow( b[2]-a[2],2) );
	  			
	  	if(normYZ==0){
	  		return Math.PI/2;
	  	}
	  	else{
	  		if(normXZ==0){
	  			return 0;
	  		}
	  		else{
	  			var alpha=Math.acos((b[1]-a[1])/getLengthBond(a,b));
	  			if( (b[2]-a[2])<0 ){
	  				return alpha+Math.PI;
	  			}
	  			else{
	  				return alpha;
	  			}
	  		}
	  	}
	  	
	  	/**
	  	if((b[1]-a[1])==0){
	  		return Math.PI/2;
	  	}
	  	else{
	  		var alpha=Math.atan((Math.sqrt(Math.pow(b[0]-a[0],2) + Math.pow(b[2]-a[2],2) ))/(b[1]-a[1]));
	  		return alpha;
	  	}
	  	*/
	  }

	  /**
	   *@param a=[.,.,.], b=[.,.,.] are the limits of the bonds
	   *this function is used to calculate the angle beta (around the Y axis) for the rotation of the bond
	   */
	  function getBeta(a,b){
	  	var normXZ=Math.sqrt( Math.pow( b[0]-a[0],2)+Math.pow( b[2]-a[2],2) );
	  	var normYZ=Math.sqrt( Math.pow( b[1]-a[1],2)+Math.pow( b[2]-a[2],2) );
	  		
	  	if(normXZ==0){
	  		return 0;
	  	}
	  	else{
	  		if(normYZ==0){
	  			return Math.PI/2;
	  		}
	  		else{
	  			var beta=Math.acos((b[0]-a[0])/normXZ);
	  			if( (b[2]-a[2])<0 ){
	  				return Math.PI/2+beta;
	  			}
	  			else{
	  				return Math.PI/2-beta;
	  			}
	  		}
	  	}
	  	
	  	/**
	  	if((b[0]-a[0])==0){
	  		return 0;
	  	}
	  	else{
	  		var beta=Math.atan((b[2]-a[2])/(b[0]-a[0])); 
	  		return -( Math.PI/2-beta );
	  	}
	  	*/
	  }

	  //functions to create bonds for the lattice
	  /**
	   *
	   */
	  function createBondShape(a,b){
	  	var length=getLengthBond(a,b);
	  	
	  	var cylinder = o3djs.primitives.createCylinder(
	        g_pack,
	        createMaterial([0,0,1,1]),
	        0.1,   // Radius.
	        length,   // Height.
	        20,    // Number of radial subdivisions.
	        20);   // Number of vertical subdivisions.
	  	
	  	return cylinder;
	  }

	  /**
	   *
	   */
	  function createTransformTableBonds(tableBonds){
	  	var transformTableBonds = [];
	  	
	  	for( var i=0; i<tableBonds.length; i++){
	  		
	  		var a=tableBonds[i][0];
	  		var b=tableBonds[i][1];
	  		
	  		var bondShape=createBondShape(a,b);
	  		var bondTranslation=getTranslation(a,b);
	  		var bondRotation=[getAlpha(a,b), getBeta(a,b), 0];
	  		
	  		transformTableBonds[i]={shape: bondShape, translation: bondTranslation, rotation: bondRotation};
	  	}
	  	
	  	return transformTableBonds;
	  }


	  //functions to create the supercell

	  //not used anymore
	  /**
	   *
	   */
	  function createSuperCell(sizeX, sizeY, sizeZ, tableLattice, tableAtom, tableBonds){
	  	var expandTableAtom=[];
	  	var expandTableBonds=[];
	  	
	  	for(var expandX=0; expandX<sizeX; expandX++){
	  		for(var expandY=0; expandY<sizeY; expandY++){
	  			for(var expandZ=0; expandZ<sizeZ; expandZ++){
	  				//expansion of the table Atom
	  				for(var indexTableAtom=0; indexTableAtom<tableAtom.length; indexTableAtom++){
	  					var positionAtom=tableAtom[indexTableAtom][1];//initial position of the atom
	  					positionAtom=translation(positionAtom, tableLattice[0],expandX);//translation along the X axis
	  					positionAtom=translation(positionAtom, tableLattice[1],expandY);//translation along the Y axis
	  					positionAtom=translation(positionAtom, tableLattice[2],expandZ);//translation along the Z axis
	  				
	  					expandTableAtom.push([tableAtom[indexTableAtom][0], positionAtom]);//positionAtom+translationVectorX*expandX+translationVectorY*expandY+translationVectorZ*expandZ
	  				}
	  				
	  				//expansion of the table Bonds
	  				for(var indexTableBonds=0; indexTableBonds<tableBonds.length; indexTableBonds++){
	  					var positionBond1=tableBonds[indexTableBonds][0];
	  					var positionBond2=tableBonds[indexTableBonds][1];
	  					
	  					positionBond1=translation(positionBond1, tableLattice[0],expandX);//translation along the X axis
	  					positionBond1=translation(positionBond1, tableLattice[1],expandY);//translation along the Y axis
	  					positionBond1=translation(positionBond1, tableLattice[2],expandZ);//translation along the Z axis
	  					
	  					positionBond2=translation(positionBond2, tableLattice[0],expandX);//translation along the X axis
	  					positionBond2=translation(positionBond2, tableLattice[1],expandY);//translation along the Y axis
	  					positionBond2=translation(positionBond2, tableLattice[2],expandZ);//translation along the Z axis
	  					
	  					expandTableBonds.push([positionBond1,positionBond2]);
	  				}				
	  			}
	  		}
	  	}
	  	return [expandTableAtom, expandTableBonds];
	  }

	  /**
	   *this function is used to calculate the new position after a translation
	   */
	  function translation(point, vector, multiple){
	  	var newPosition=[point[0]+vector[0]*multiple, point[1]+vector[1]*multiple, point[2]+vector[2]*multiple];
	  	return newPosition;
	  }

	  //need to be updated
	  /**
	   *
	   */
	  function createTablePointsSupercell(tableLattice,sizeX, sizeY, sizeZ){
	  	var tablePointsSupercell=[];
	  	
	  	for(var indexY=0; indexY<sizeY+1; indexY++){
	  		for(var indexZ=0; indexZ<sizeZ+1; indexZ++){
	  			var point1=translation([0,0,0], tableLattice[1], indexY);
	  			point1=translation(point1, tableLattice[2], indexZ);
	  			
	  			//translation to the center of the lattice
	  			point1=translation(point1, tableLattice[0], -sizeX/2);
	  			point1=translation(point1, tableLattice[1], -sizeY/2);
	  			point1=translation(point1, tableLattice[2], -sizeZ/2);
	  			
	  			var point2=translation([0,0,0], tableLattice[0], sizeX);
	  			point2=translation(point2, tableLattice[1], indexY);
	  			point2=translation(point2, tableLattice[2], indexZ);
	  			
	  			//translation to the center of the lattice
	  			point2=translation(point2, tableLattice[0], -sizeX/2);
	  			point2=translation(point2, tableLattice[1], -sizeY/2);
	  			point2=translation(point2, tableLattice[2], -sizeZ/2);
	  			
	  			tablePointsSupercell.push([point1, point2]);
	  		}
	  	}
	  	
	  	for(var indexX=0; indexX<sizeX+1; indexX++){
	  		for(var indexY=0; indexY<sizeY+1; indexY++){
	  			var point1=translation([0,0,0], tableLattice[0], indexX);
	  			point1=translation(point1, tableLattice[1], indexY);
	  			
	  			//translation to the center of the lattice
	  			point1=translation(point1, tableLattice[0], -sizeX/2);
	  			point1=translation(point1, tableLattice[1], -sizeY/2);
	  			point1=translation(point1, tableLattice[2], -sizeZ/2);
	  						
	  			var point2=translation([0,0,0], tableLattice[2], sizeZ);
	  			point2=translation(point2, tableLattice[0], indexX);
	  			point2=translation(point2, tableLattice[1], indexY);
	  			
	  			//translation to the center of the lattice
	  			point2=translation(point2, tableLattice[0], -sizeX/2);
	  			point2=translation(point2, tableLattice[1], -sizeY/2);
	  			point2=translation(point2, tableLattice[2], -sizeZ/2);
	  						
	  			tablePointsSupercell.push([point1, point2]);
	  		}
	  	}
	  	
	  	for(var indexX=0; indexX<sizeX+1; indexX++){
	  		for(var indexZ=0; indexZ<sizeZ+1; indexZ++){
	  			var point1=translation([0,0,0], tableLattice[0], indexX);
	  			point1=translation(point1, tableLattice[2], indexZ);
	  			
	  			//translation to the center of the lattice
	  			point1=translation(point1, tableLattice[0], -sizeX/2);
	  			point1=translation(point1, tableLattice[1], -sizeY/2);
	  			point1=translation(point1, tableLattice[2], -sizeZ/2);
	  						
	  			var point2=translation([0,0,0], tableLattice[1], sizeY);
	  			point2=translation(point2, tableLattice[0], indexX);
	  			point2=translation(point2, tableLattice[2], indexZ);
	  			
	  			//translation to the center of the lattice
	  			point2=translation(point2, tableLattice[0], -sizeX/2);
	  			point2=translation(point2, tableLattice[1], -sizeY/2);
	  			point2=translation(point2, tableLattice[2], -sizeZ/2);
	  						
	  			tablePointsSupercell.push([point1, point2]);
	  		}
	  	}
	  	
	  	return tablePointsSupercell;
	  }

	  /**
	   *this function creates a red line between two given points
	   */
	  function createShapeForSupercellLine(point1,point2){
	  	var pack=g_pack;
	  	var colorOrTexture=[1,0,0,1];
	  		
	  	var material=o3djs.material.createConstantMaterial(g_pack,
	  														g_viewInfo,
	  														colorOrTexture);
	  	var vertices = [
	  		point1[0], point1[1], point1[2],// vertex 0
	  		point2[0], point2[1], point2[2]//vertex 1
	      ];
	  	
	  	var indices = [
	        0, 1 // line 1
	  	];
	  	
	  	var shape = o3djs.debug.createLineShape(
	  					g_pack,
	                      material,
	                      vertices,
	                      indices);
	  	return shape;
	  }

	  /**
	  *
	  */
	  function createTransformTableSupercell(tableLattice, sizeX, sizeY, sizeZ){
	  	var transformTableSupercell = [];
	  	
	  	var tablePointsSupercell=createTablePointsSupercell(tableLattice, sizeX, sizeY, sizeZ);
	  	
	  	for( var i=0; i<tablePointsSupercell.length; i++){
	  		
	  		var point1=tablePointsSupercell[i][0];
	  		var point2=tablePointsSupercell[i][1];
	  		
	  		var lineShape=createShapeForSupercellLine(point1,point2);
	  		
	  		transformTableSupercell[i]={shape: lineShape};
	  	}
	  	
	  	return transformTableSupercell;
	  	
	  }

	  //functions for the management of the user----------------------------------------------
	  /**
	   * Zooms the scene in / out by changing the viewpoint.
	   * @param {number} zoom zooming factor.
	   */
	  function ZoomInOut(zoom) {
	    for (var i = 0; i < g_eyeView.length; i += 1) {
	      g_eyeView[i] = g_eyeView[i] / zoom;
	    }

	    g_viewInfo.drawContext.view = g_math.matrix4.lookAt(
	        g_eyeView,   // eye.
	        [0, 0, 0],     // target.
	        [0, 1, 0]);   // up.
	  }

	  /**
	   * Start mouse dragging.
	   * @param {event} e event.
	   */
	  function startDragging(e) {
	    detectSelectionCell(e);
	    g_lastRot = g_thisRot;

	    g_aball.click([e.x, e.y]);
	    g_dragging = true;
	  }

	  /**
	   * Use the arcball to rotate the scene.
	   * Computes the rotation matrix.
	   * @param {event} e event.
	   */
	  function drag(e) {
	    if (g_dragging) {
	      var rotationQuat = g_aball.drag([e.x, e.y]);
	      var rot_mat = g_quaternions.quaternionToRotation(rotationQuat);

	      g_thisRot = g_math.matrix4.mul(g_lastRot, rot_mat);
	      var m = g_sceneRoot.localMatrix;
	      g_math.matrix4.setUpper3x3(m, g_thisRot);
	      g_sceneRoot.localMatrix = m;
	    }
	  }

	  /**
	   * Stop dragging.
	   * @param {event} e event.
	   */
	  function stopDragging(e) {
	    g_dragging = false;
	  }

	  /**
	   * Using the mouse wheel zoom in and out of the scene.
	   * @param {event} e event.
	   */
	  function scrollMe(e) {
	    var zoom = (e.deltaY < 0) ? 1 / g_zoomFactor : g_zoomFactor;
	    ZoomInOut(zoom);
	    g_client.render();
	  }
	  
	    /**
	     * Removes any callbacks so they don't get called after the page has unloaded.
	     */
	    function uninit() {
	      if (g_client) {
	        g_client.cleanup();
	      }
	    }
	  
    function createViewContainer() {
      var table = tag('table'); table.addClass('o3d-scence-container');
      table.width(800); table.height(800);
      
      var tr = tag('tr'); table.append(tr);

      var td = tag('td'); tr.append(td);
      td.css('height', '100%');
      
      var div = tag('div', {id:'o3d'}); td.append(div);
      div.css('width', '100%');
      div.css('height', '100%');

      var loading = tag('div', {id:'loading'}); td.append(loading);
      loading.css('color', 'red');
      return table;
    }

    var container = createViewContainer();
    container.bind('append', initClient);
    container.unload(uninit);
    //var body = $('body');
    //body.load(init); body.unload(uninit);
    return container;
  }
  
  // matterbuilder
  ef.matterbuilder = function (kwds, docmill, parent) {
    var Class = kwds.Class;
    var id = kwds.id;
    var ret = tag('div', {'id': id});

    ret.addClass(Class);
    ret.addClass('luban-matterbuilder');

    var onclick = kwds.onclick;
    if (onclick) 
      ret.click( function() { docmill.compile(onclick); return false; } );

    ret = ret.lubanElement('matterbuilder');
    if (parent) parent.add(ret);

    atoms = kwds.atoms;
    var scene = createScene(atoms);
    ret.jqueryelem.append(scene);
    scene.trigger('append');

    return ret;
  };

  widgets.matterbuilder = function(elem) {
    this.super1 = widgets.base;
    this.super1(elem);
  };
  // self check
  widgets.matterbuilder.selfcheck = function() {
    var required;
    try {
      required = o3djs;
    } catch (e) {
      //throw;
      return true;
    }
    var base = required.base;
    if (base == null) return true;
    if (base.setErrorHandler == null) return true;
    return false;
  };
  widgets.matterbuilder.prototype = new widgets.base;

})(luban, jQuery);


// End of file
