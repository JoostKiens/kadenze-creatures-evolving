/**
 * The population has flocking behavior as in session 3:
 * - alignment
 * - cohesion
 * - separation
 * It has one other steering force:
 * - pursuit
 *
 * The population pursues the target, which itself has a gravitational attraction to the attractor & flees from boids
 *
 * Clicking the canvas positions the target at the location of the mouse
 * Pressing Enter resets the world
 */
// Elements
var attractor
var population
var target
// Variable for backround alpha variation (trails)
var alphaOff
var myFont

// Preload fonts
function preload() {
  myFont = loadFont('assets/RobotoCondensed-Regular.ttf');
}

function setup() {
  var canvas = createCanvas(windowWidth, windowHeight)
  canvas.parent('canvas')
  initWorld()
}

// Starts world with target, population attractor
function initWorld() {
  alphaOff = random(100)
  // Initialize elements
  target     = new Target(width / 4, height / 4 , 5)
  population = new Population(target)
  attractor  = new Attractor(width / 2, height / 2, 20)

  // Add 100 boids in random locations
  for (var i = 0; i < 100; i++) {
    var b = new Boid(random(100, width - 100), random(100, height - 100), target, new DNA())
    population.addBoid(b)
  }
}

function mouseClicked(e) {
  // Position target at mouse position if clicked on canvase
  // Note: velocity and acceleration are not impacted
  e.preventDefault()
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    target.position = createVector(mouseX, mouseY)
  }
}

function keyPressed(e) {
  if (keyCode === ENTER) {
    fill(0)
    noStroke()
    rect(0, 0, width, height)
    initWorld()
  }
}

function draw() {
  // Background alpha noise, shamelessly borrowed
  // from https://www.kadenze.com/coursework_field_entries/56397/view_runnable
  var backgroundAlpha = map(noise(alphaOff), 0, 1, 0, 20)
  background(0, backgroundAlpha)
  alphaOff += 0.5

  // Update target
  // Attract to attractor
  var force = attractor.calculateAttraction(target)
  target.applyForce(force)

  // Flee from boids
  population.boids.forEach(function (boid) {
    var steer = target.flee(boid.position.copy())
    steer && target.applyForce(steer.mult(0.75))
  })
  target.borders()
  target.update()
  target.render()

  // Update population
  population.run()
  drawText()
}

// Add text displaying current information
function drawText() {
  fill(0)
  stroke(55)
  rect(0, 0, 150, 120)
  noStroke()
  fill(255)
  textFont(myFont, 10)
  text('Population: ' + population.boids.length, 10, 14 * 1)
  text('Avg. cohesion: ' + roundTo2Decimals(averageBoidDNA('cohesion')), 10, 14 * 2)
  text('Avg. mass: ' + roundTo2Decimals(averageBoidDNA('mass')), 10, 14 * 3)
  text('Avg. maxspeed: ' + roundTo2Decimals(averageBoidDNA('maxspeed')), 10, 14 * 4)
  text('Avg. maxforce: ' + roundTo2Decimals(averageBoidDNA('maxforce')), 10, 14 * 5)
  text('Avg. separation: ' + roundTo2Decimals(averageBoidDNA('separation')), 10, 14 * 6)
  text('Avg. alignment: ' + roundTo2Decimals(averageBoidDNA('alignment')), 10, 14 * 7)
  text('Avg. pursuit: ' + roundTo2Decimals(averageBoidDNA('pursuit')), 10, 14 * 8)

  text('Press ENTER to start over', 10, height - 14)
}

function roundTo2Decimals(val) {
  return Math.round(val * 100) / 100
}

function averageBoidDNA(gene) {
  return population.boids.reduce(function(previousValue, boid, currentIndex, array) {
    return Number(previousValue) + Number(boid.dna.genes[0][gene])
  }, 0) / population.boids.length
}
