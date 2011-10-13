o3djs.require('o3djs.simple');

// Events
// init() once the page has finished loading.
window.onload = init;

// global variables
// we make these global so we can easily access them from the debugger.
var g_simple;
var g_cube;
var g_finished = false;  // for selenium testing

/**
 * Creates the client area.
 */
function init() {
  o3djs.util.makeClients(initStep2);
}

/**
 * Initializes our app.
 * @param {Array} clientElements Array of o3d object elements.
 */
function initStep2(clientElements) {
  // Initializes global variables and libraries.
  var o3dElement = clientElements[0];

  // Create an o3djs.simple object to manage things in a simple way.
  g_simple = o3djs.simple.create(o3dElement);

  // Create a cube.
  g_cube = g_simple.createCube(50);

  // You should now have a cube on the screen!
  // Examples of other commands you can issue (live from firebug if you want)
  //
  // g_cube.transform.translate(0, 0, -50);  // translate the cube.
  // g_cube.setDiffuseColor(1, 0, 0, 1);  // make the cube red.
  // g_cube.loadTexture("http://someplace.org/somefile.jpg");  // now textured.
  // g_simple.setCameraPosition(200, 100, -50);  // move the camera
  // g_simple.setCameraTarget(0, 10, 0);  // move the camera's target
  // g_simple.setFieldOfView(30 * Math.PI / 180);  // change the field of view.
  // g_sphere = g_simple.createSphere(20, 10);  // create a sphere.
  //
  // Try typing these commands from firebug live!

  g_finished = true;  // for selenium testing.
}
