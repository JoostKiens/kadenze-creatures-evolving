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
    // Copy each gene object, otherwise parent and child would share (and mutate) the same genes
    return new DNA(this.genes.map(function (gene) { return Object.assign({}, gene) }))
  }

  // Based on a mutation probability, picks a new random trait
  this.mutate = function (m) {
    for (var i = 0; i < this.genes.length; i++) {
      if (random(1) < m) {
        var newGenes = getRandomGenes()
        var randomTrait = randomKey(newGenes)
        this.genes[i][randomTrait] = newGenes[randomTrait]
      }
    }
  }
}

// Get a random key from an object
function randomKey (obj) {
  var keys = Object.keys(obj)
  return keys[ keys.length * Math.random() << 0]
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
