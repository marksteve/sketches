window.THREE = require('three')
var loadSvg = require('load-svg')
var extractSvgPath = require('extract-svg-path').parse
var createGeometry = require('three-simplicial-complex')(THREE)
var background = require('three-vignette-background')(THREE)
var svgMesh3d = require('svg-mesh-3d')
var glslify = require('glslify')
var OrbitControls = require('three-orbit-controls')(THREE)
var css = require('dom-css')

var scene
var camera
var renderer
var meshes = {}

var alphaWidth = 768
var alphaHeight = 960

function addMesh (name, filename, material, viewbox, z) {
  var x = viewbox[0]
  var y = viewbox[1]
  var w = viewbox[2]
  var h = viewbox[3]
  var scale = Math.max(w, h) / 2
  return new Promise(function (resolve, reject) {
    loadSvg(filename, function (err, svg) {
      if (err) return reject(err)
      var svgPath = extractSvgPath(svg)
      var meshData = svgMesh3d(svgPath, { scale: 0.1, simplify: 5 })
      var geometry = createGeometry(meshData)
      geometry.scale(scale, scale, scale)
      var mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)
      mesh.position.x = w / 2 + x - alphaWidth / 2
      mesh.position.y = -h / 2 - y + alphaHeight / 2
      mesh.position.z = z
      meshes[name] = mesh
      resolve(mesh)
    })
  })
}

function addEdges (mesh) {
  var edges = new THREE.EdgesHelper(mesh, 0x333333)
  edges.material.linewidth = 2
  scene.add(edges)
  return mesh
}

function addMeshes () {
  var white = new THREE.MeshBasicMaterial({ color: 0xffffff })
  addMesh('white', 'assets/white.svg', white, [117, 25, 546, 759], 0)
    .then(addEdges)
  addMesh('lines', 'assets/lines.svg', white, [70, 50, 640, 840], 0)
    .then(addEdges)
  addMesh('dither', 'assets/dither.svg', white, [195, 50, 390, 870], 0)
    .then(addEdges)
  addMesh('hair', 'assets/hair.svg', white, [65, 205, 650, 649], 0)
    .then(addEdges)
  var black = new THREE.MeshBasicMaterial({ color: 0x333333 })
  addMesh('black', 'assets/black.svg', black, [250, 349, 280, 455], 0)
  var noise = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    vertexShader: glslify('./shaders/mesh.vert'),
    fragmentShader: glslify('./shaders/noise.frag'),
    uniforms: {
      time: { value: 0 },
      resolution: { value: new THREE.Vector2(
        renderer.context.drawingBufferWidth,
        renderer.context.drawingBufferHeight)
      }
    }
  })
  addMesh('noise', 'assets/noise.svg', noise, [65, 140, 650, 645], 0)
}

function init () {
  scene = new THREE.Scene()
  scene.add(background)
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.z = 600
  new OrbitControls(camera) // eslint-disable-line
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0xffffff, 1)

  addMeshes()

  var body = document.body
  css(body, { margin: 0, overflow: 'hidden' })
  body.appendChild(renderer.domElement)

  animate()
}

var time = 0
var prevDate = new Date()
var noiseTime = 0

function animate () {
  window.requestAnimationFrame(animate)
  var dt = new Date() - prevDate
  prevDate = new Date()
  time += dt
  if (meshes.noise) {
    if (time - noiseTime > 50) {
      meshes.noise.material.uniforms.time.value = 0.001 * noiseTime
      noiseTime = time
    }
  }
  renderer.render(scene, camera)
}

init()

