/**
 * Element which the boids pursue,
 * Target itself is invisible
 * @param {Number} x coordinate
 * @param {Number} y coordinate
 * @param {Number} m mass
 */
function Target(x, y, m) {
  this.position     = createVector(x, y)
  this.velocity     = createVector(random(-4, 4), random(-4, 4))
  this.acceleration = createVector(0, 0)
  this.maxspeed     = 4
  this.maxforce     = 0.1
  this.mass         = m
  this.r            = this.mass * 2

  // 2nd law of Newton
  // a = F / m
  this.applyForce = function (force) {
    this.acceleration.add(force.copy().div(this.mass))
  }

  // Update position, based on velocity & acceleration
  this.update = function () {
    this.velocity.add(this.acceleration)
    // Limit speed
    this.velocity.limit(this.maxspeed)
    this.position.add(this.velocity)
    // Reset accelaration
    this.acceleration.set(0, 0)
  }

  // Calulate steering force away a target
  // STEER = DESIRED - VELOCITY
  this.flee = function (target) {
    var e = p5.Vector.sub(target, this.position)
    var distance = e.mag()
    if (distance > 0 && distance < 200) {
      e.normalize()
      e = e.mult(this.maxspeed)
      return steer = p5.Vector.sub(e, this.velocity).limit(this.maxforce).mult(-1)
    }
  };

  // Wraparound target when it's leaving the canvas
  this.borders = function() {
    if (this.position.x < -this.r) this.position.x = width + this.r
    if (this.position.y < -this.r) this.position.y = height + this.r
    if (this.position.x > width + this.r) this.position.x = -this.r
    if (this.position.y > height + this.r) this.position.y = -this.r
  }

  // Draw target on screen
  this.render = function () {
    fill(59, 240, 230)
    noStroke()
    ellipse(this.position.x, this.position.y, this.r, this.r)
  }
}
