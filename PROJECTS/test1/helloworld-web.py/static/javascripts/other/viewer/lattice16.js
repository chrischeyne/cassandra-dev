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
//var g_cubeShape;
//var g_cylinderShape;
//var g_prismShape;
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
var g_oldFlashTimer;

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

var tableLattice = [[1,0,0],[0,1,0],[0,0,1]];
var tableAtom = [];
var tableBond = [];
// i.e.
//var tableLattice = [[5,0,0],[-1,5,0],[0,0,5]];
//var tableAtom = [['Fe', [0.5,0.5,0.5]], ['C', [2.5,2.5,2.5]]];
//var tableBond = [ [[0.5,0.5,0.5],[2.5,2.5,2.5]]];
var sizeX=1;//expand of the supercell along X
var sizeY=1;//expand of the supercell along Y
var sizeZ=1;//expand of the supercell along Z
var latticeParameterX;
var latticeParameterY;
var latticeParameterZ;

var g_lattice = []; //table with all the lattice information
var g_selectedAtom=[];
var g_selectedBond=[];

//functions to initialize ------------------------------------------------------------------------------------
/**
 * Creates the client area.
 */
function initClient(lattice, atoms) {
  	window.g_finished = false;  // for selenium testing.
	tableLattice = lattice
	tableAtom = atoms	

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
	  
	//lattice environment
	
	//drawlattice(tableLattice, tableAtoms, tableBonds, sizeX, sizeY, sizeZ);
	createLattice(sizeX, sizeY, sizeZ, tableLattice, tableAtom)
	//createBonds(sizeX, sizeY, sizeZ, tableLattice, tableBonds)
		  
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

//  // Create a cube shape for the board squares.
//  g_cubeShape = o3djs.primitives.createCube(
//      g_pack,
//      g_material,
//      1);

//  // use an extruded polygon to create a 'crown' for the king piece.
//  var polygon = [[0, 0], [1, 0], [1.5, 1.5], [0.5, 0.5],
//                 [0, 2], [-0.5, 0.5], [-1.5, 1.5], [-1, 0]];

//  // use the 'prism' primitive for the crown.
//  g_prismShape = o3djs.primitives.createPrism(
//      g_pack,
//      g_material,
//      polygon,     // The profile polygon to be extruded.
//      1);          // The depth of the extrusion.

  // Get the status element.
  g_statusInfoElem = o3djs.util.getElementById('statusInfo');

  // Initialize various animation globals.
  g_flashTimer = 0;
  g_oldFlashTimer = 0;
  
  //initialize lattice variables
  initlatticeVariables();
}

/**
 * Initialize the original view of the scene.
 */
function initContext() {
  g_eyeView = [-5, 15, 12];
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


//converted
/**
 * Creates a cellInfo object to hold unit cell information.
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
 * Creates the (super)lattice and atoms.
 */
function createLattice(sizeX, sizeY, sizeZ, tableLattice, tableAtom) {
	//g_lattice = [];
	
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
 * Creates the bonds.
 */
function createBonds(sizeX, sizeY, sizeZ, tableLattice, tableBond) {
	//g_lattice = [];
	
	//create the atoms and the bonds inside each unitcell
	for (var indexX = 0; indexX < sizeX; indexX++) {//duplicate the cell along the X axis
		g_lattice[indexX] = [];
		for (var indexY = 0; indexY < sizeY; indexY++) {//duplicate the cell along the Y axis
			g_lattice[indexX][indexY]=[];
			for(var indexZ=0; indexZ<sizeZ; indexZ++){
				//create the info in the lattice table
				g_lattice[indexX][indexY][indexZ] = new CellInfo(indexX, indexY, indexZ);
				
				//create the bonds inside the cell
				for(var indexTableBond=0; indexTableBond<tableBond.length; indexTableBond++){
					//create the transform for the bond
					var bond=g_pack.createObject('Transform');
					bond.parent=g_sceneRoot;
					bond.addShape(createBondShape(tableBond[indexTableBond][0],tableBond[indexTableBond][1]) );
					bond.cull = true;
					
					//translate the bond relatively to the middle of the two points
					var bondTranslation=getTranslation(tableBond[indexTableBond][0],tableBond[indexTableBond][1]);
					
					//translate the bond relative to the position of the cell
					bondTranslation=translation(bondTranslation, tableLattice[0], indexX);//translation along X with the X vector of the lattice
					bondTranslation=translation(bondTranslation, tableLattice[1], indexY);//translation along Y with the Y vector of the lattice
					bondTranslation=translation(bondTranslation, tableLattice[2], indexZ);//translation along Z with the Z vector of the lattice
					
					//translate the bond realtive to the cneter of the supercell
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
	updateTreeInfo();	
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

//functions for zooming/dragging----------------------------------------------
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

function uninit() {
  if (g_client) {
    g_client.cleanup();
  }
}