// Class to describe DNA
// Constructor (makes a random DNA)
function DNA(newGenes) {
  if (newGenes) {
    this.genes = newGenes;
  } else {
    // The genetic sequence
    // DNA is an object containing:
    // - separation
    // - alignment
    // - cohesion
    // - pursue
    // - maxspeed
    // - maxforce
    // - mass
    this.genes = new Array(1);
    for (var i = 0; i < this.genes.length; i++) {
      this.genes[i] = getRandomGenes()
    }
  }

  this.copy = function () {
    return new DNA(this.genes.slice(0))
  }

  // Based on a mutation probability, picks a new random trait
  this.mutate = function (m) {
    for (var i = 0; i < this.genes.length; i++) {
      if (random(1) < m) {
        var newGenes = getRandomGenes()
        var randomTrait = randomProperty(newGenes)
        this.genes[i][randomTrait] = newGenes[randomTrait]
      }
    }
  }
}

// Get a random key from ab object
function randomProperty (obj) {
  var keys = Object.keys(obj)
  return obj[keys[ keys.length * Math.random() << 0]]
}

// Default settings for DNA
function getRandomGenes() {
  return {
    cohesion:   random(0, 4),
    separation: random(1, 5),
    alignment:  random(1, 5),
    pursuit:    random(1, 6),
    maxspeed:   random(1, 6),
    maxforce:   random(0, 0.1),
    mass:       random(2, 8)
  }
}
