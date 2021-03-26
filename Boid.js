// Just some nice colors for our boids
var colors = [
  'rgb(250,243,137)',
  'rgb(250,240,5)',
  'rgb(250,143,5)',
  'rgb(250,108,5)',
  'rgb(250,28,5)'
]

/**
 * Boid with several flocking behaviors
 * - pursue
 * - separate
 * - align
 * - cohesion
 *
 * @param {Number} x      coordinate
 * @param {Number} y      coordinate
 * @param {Number} mass   mass
 * @param {Target} target instance of Target
 */
function Boid(x, y, target, dna_) {
  this.position     = createVector(x, y)
  this.velocity     = createVector(random(-1, 1), random(-1, 1))
  this.acceleration = createVector(0, 0)
  this.dna          = dna_
  this.mass         = this.dna.genes[0].mass
  this.r            = this.mass * 2
  this.health       = 200  // Life timer
  // Pick a random color
  this.fill         = shuffle(colors)[0]
  this.target       = target

  // Group of methods to be executed every draw
  this.run = function (boids) {
    this.flock(boids)
    this.update()
    this.borders()
    this.render()
    this.health -= 0.3
  }

  // 2nd law of Newton
  // a = F / m
  this.applyForce = function (force) {
    this.acceleration.add(force.copy().div(this.mass))
  }

  // Craig Reynold's pursuit
  // http://rocketmandevelopment.com/blog/steering-behaviors-pursuit-and-evade/
  this.pursue = function () {
    var distance       = p5.Vector.dist(this.target.position, this.position)
    var t              = distance / this.target.maxspeed
    var targetPosition = p5.Vector.add(this.target.position, p5.Vector.mult(this.target.velocity, t))
    return this.seek(targetPosition)
  }

  // We accumulate a new acceleration each time based on four rules
  this.flock = function (boids) {
    var sep = this.separate(boids) // Separation
    var ali = this.align(boids)    // Alignment
    var coh = this.cohesion(boids) // Cohesion
    var pur = this.pursue()        // Pursuit

    // Apply weight to these forces based on slider values
    sep.mult(this.dna.genes[0].separation)
    ali.mult(this.dna.genes[0].alignment)
    coh.mult(this.dna.genes[0].cohesion)
    pur.mult(this.dna.genes[0].pursuit)
    this.maxspeed = this.dna.genes[0].maxspeed
    this.maxforce = this.dna.genes[0].maxforce

    // Add the force vectors to acceleration
    this.applyForce(sep)
    this.applyForce(ali)
    this.applyForce(coh)
    this.applyForce(pur)
  };

  this.update = function () {
    this.velocity.add(this.acceleration)
    // Limit speed
    this.velocity.limit(this.maxspeed)
    this.position.add(this.velocity)
    // Reset acceleration
    this.acceleration.set(0, 0)
  };

  // Calulate steering force towards a target
  // STEER = DESIRED - VELOCITY
  this.seek = function (target) {
    // A vector pointing from the location to the target
    var desired = p5.Vector.sub(target, this.position)
    // Normalize desired and scale to maximum speed
    desired.normalize().mult(this.maxspeed)
    // STEER = DESIRED - VELOCITY
    var steer = p5.Vector.sub(desired, this.velocity)
    steer.limit(this.maxforce) // Limit to maximum steering force
    return steer
  };


  // Separation
  // Check for nearby boids within radius and steers away
  this.separate = function (boids) {
    var steer             = createVector(0, 0)
    var count             = 0
    var desiredSeparation = 25.0

    // For every boid in the system, check if it's too close
    boids.forEach(function (boid) {
      var d = p5.Vector.dist(this.position, boid.position)
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if ((d > 0) && (d < desiredSeparation)) {
        // Calculate vector pointing away from neighbor
        var diff = p5.Vector.sub(this.position, boid.position)
        // Weight by distance
        diff.normalize().div(d)
        steer.add(diff)
        // Keep track of how many
        count++
      }
    }.bind(this))

    // Average -- divide by how many
    if (count > 0) {
      steer.div(count)
    }

    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize()
      steer.mult(this.maxspeed)
      steer.sub(this.velocity)
      steer.limit(this.maxforce)
    }
    return steer
  }

  // Alignment
  // For every nearby boid in the system, calculate the average velocity
  this.align = function (boids) {
    var neighborDist = 50
    var sum          = createVector(0, 0)
    var count        = 0

    boids.forEach(function (boid) {
      var d = p5.Vector.dist(this.position, boid.position);
      if ((d > 0) && (d < neighborDist)) {
        sum.add(boid.velocity)
        count++
      }
    }.bind(this))

    if (count > 0) {
      sum.div(count).normalize().mult(this.maxspeed)
      return p5.Vector.sub(sum, this.velocity).limit(this.maxforce)
    } else {
      return createVector(0, 0)
    }
  }

  // Cohesion
  // For the average location (i.e. center) of all nearby boids,
  // calculate steering vector towards that location
  this.cohesion = function (boids) {
    var neighborDist = 50
    // Start with empty vector to accumulate all locations
    var sum          = createVector(0, 0)
    var count        = 0

    boids.forEach(function (boid) {
      var d = p5.Vector.dist(this.position, boid.position);
      if ((d > 0) && (d < neighborDist)) {
        // Add location
        sum.add(boid.position)
        count++
      }
    }.bind(this))

    return count > 0  ? this.seek(sum.div(count)) : createVector(0, 0)
  }

  // At any moment there is a teeny, tiny chance a Boid will reproduce
  this.calcFitness = function() {
    // asexual reproduction
    if (random(1) < 0.0008) {
      // Child is exact copy of single parent
      var childDNA = this.dna.copy()
      // Child DNA can mutate
      childDNA.mutate(0.5)
      return new Boid(this.position.x, this.position.y, this.target, childDNA)
    }
    else {
      return null
    }
  }

  // Increase health when boid hits target
  this.eat = function(target) {
    if (p5.Vector.dist(this.position, target.position) < this.r / 2) {
      this.health += 100
    }
  }

  // Returns triue if health is less than 0
  this.dead = function() {
    return (this.health < 0.0)
  }

  // Wraparound boids when they are leaving the canvas
  this.borders = function() {
    if (this.position.x < -this.r) this.position.x = width + this.r;
    if (this.position.y < -this.r) this.position.y = height + this.r;
    if (this.position.x > width + this.r) this.position.x = -this.r;
    if (this.position.y > height + this.r) this.position.y = -this.r;
  }

  this.render = function() {
    var c = color(this.fill)
    fill(red(c), green(c), blue(c), map(this.health, 0, 200, 0, 255))
    noStroke()
    ellipse(this.position.x, this.position.y, this.mass * 2, this.mass * 2)
  }
}
