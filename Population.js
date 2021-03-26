/**
 * Population constructor, manages the array of boids, determines life & death
 */
function Population(target) {
  // An array for all the boids
  this.boids  = []
  // Reference to the target instance
  this.target = target

  // Calls run method on each boid with the entire list of boid passed
  this.run = function () {
    for (var i = this.boids.length-1; i >= 0; i--) {
      var boid = this.boids[i]
      boid.run(this.boids)
      boid.eat(this.target)
      // If it's dead, kill it
      if (boid.dead()) {
        this.boids.splice(i, 1)
      }
      // Perhaps this boid would like to make a baby?
      var child = boid.calcFitness()
      if (child !== null) {
        this.boids.push(child)
      }
    }
  }

  this.addBoid = function (boid) {
    this.boids.push(boid)
  }
}
