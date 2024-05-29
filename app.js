document.addEventListener('DOMContentLoaded', () => {
  // Classes _______________________________________________

  class Grid {
    constructor() {
      this.color = "white";
      this.limit = 25;
      this.elements = document.getElementsByClassName("gridElement");
    }

    create() {
      const grid = document.getElementById("grid");

      // Fill the grid with elements
      for (let i = 0; i < this.limit * this.limit; i++) {
        const div = document.createElement("div");
        div.setAttribute("class", "gridElement");
        grid.appendChild(div);
      }
    }
  }

  class Scoreboard {
    constructor() {
      this.points = 0;
      this.scoreboard = document.getElementById("scoreboard");
    }

    create() {
      const paragraph = document.createElement("p");
      const textNode = document.createTextNode(`Score: ${this.points}`);
      paragraph.append(textNode);
      this.scoreboard.append(paragraph);
    }

    update() {
      while (this.scoreboard.hasChildNodes()) {
        this.scoreboard.removeChild(this.scoreboard.firstChild);
      }
      const paragraph = document.createElement("p");
      const textNode = document.createTextNode(`Score: ${this.points}`);
      paragraph.append(textNode);
      this.scoreboard.append(paragraph);
    }
  }

  class Player {
    constructor() {
      this.color = "green";
      this.index = 562;
      this.photonTorpedos = {};
      this.photonTorpedoCount = 0;
      this.photonInPlay = false;
    }

    create() {
      grid.elements[this.index].style.backgroundColor = this.color;
    }

    move(e) {
      // Erase previous iteration
      grid.elements[player.index].style.backgroundColor = grid.color;

      // Increment the grid element by key code
      switch(e.keyCode) {
        case 37:
          if (player.index % grid.limit === 0) {
            player.index += grid.limit - 1;
          } else player.index -= 1;
          break;
        case 38:
          if (player.index <= grid.limit - 1 && player.index >= 0) {
            player.index += (grid.limit * grid.limit) - grid.limit;
          } else player.index -= grid.limit;
          break;
        case 39:
          if (player.index % grid.limit >= grid.limit - 1) {
            player.index -= grid.limit - 1;
          } else player.index += 1;
          break;
        case 40:
          if (player.index >= (grid.limit * grid.limit) - grid.limit) {
            player.index -= (grid.limit * grid.limit) - grid.limit;
          } else  player.index += grid.limit;
          break;
      }

      // Draw the new grid element
      grid.elements[player.index].style.backgroundColor = player.color;
    }
  }

  class PhotonTorpedo {
    constructor() {
      this.color = "blue";
      this.itr = null;
      this.count = 0;
      this.photonTorpedoCount;
      this.id;
      this.contact = false;
      this.move = this.move.bind(this);
    }

    create() {
      // Limit the number of photon torpedos to one
      if (player.photonInPlay === true) return;
      player.photonInPlay = true;
      this.count = 0;

      // Find grid element for photon torpedo
      if (player.index <= grid.limit - 1 && player.index >= 0) {
        this.itr = player.index + ((grid.limit * grid.limit) - grid.limit);
      } else this.itr = player.index - grid.limit;

      // Store photon torpedo in the record
      player.photonTorpedoCount++;
      this.photonTorpedoCount = player.photonTorpedoCount;
      player.photonTorpedos[player.photonTorpedoCount] = this.itr;

      // Draw photon torpedo
      grid.elements[this.itr].style.backgroundColor = this.color;
      this.id = setInterval(this.move, 30);
    }

    move() {
      // Find borg to delete
      const l = borg.fleet.length;
      for (let i in player.photonTorpedos) {
        const newFleet = [];

        // Where the grid element has both the borg and photon
        for (let j = 0; j < l; j++) {
          if (borg.fleet[j] === player.photonTorpedos[i]) {
            scoreboard.points += 10;
            scoreboard.update();
            this.contact = true;
          } else if (borg.fleet[j] != player.photonTorpedos[i]) {
            newFleet.push(borg.fleet[j])
          }
        }
        borg.fleet = newFleet;
      }

      // Remove previous iteration and clear if reached length
      grid.elements[this.itr].style.backgroundColor = grid.color;
      if (this.count >= 25) {
        delete player.photonTorpedos[this.photonTorpedoCount];
        clearInterval(this.id);
        player.photonInPlay = false;

      // Remove the photon torpedo if it connected with a borg
      } else if (this.contact === true) {
        delete player.photonTorpedos[this.photonTorpedoCount];
        clearInterval(this.id);
        player.photonInPlay = false;
        this.contact = false;

      // Increment count and remove if reached top
      } else {
        this.count++;
        if (this.itr <= grid.limit - 1 && this.itr >= 0) {
          delete player.photonTorpedos[this.photonTorpedoCount];
          clearInterval(this.id);
          player.photonInPlay = false;

        // Increment iteration
        } else {
          this.itr = this.itr - grid.limit;
          grid.elements[this.itr].style.backgroundColor = this.color;

          // Draw photon in grid element
          player.photonTorpedos[player.photonTorpedoCount] = this.itr;
        }
      }
    }
  }

  class Borg {
    constructor() {
      this.color = "orange";
      this.fleet = [];
      this.id;
      this.gameOver = false;
      this.moveRight = true;
      this.levelDown = false;
      this.move = this.move.bind(this);
    }

    create() {
      // Create initial grid elements
      for (let i = 0; i < 70; i++) {
        if (i === 8 || i === 10 || i === 12 || i === 14 || i === 16 ||
            i === 58 || i == 60 || i === 62 || i === 64 || i === 66)
          this.fleet.push(i);
      }

      // Draw the borg fleet
      const l = this.fleet.length;
      for (let i = 0; i < l; i++) {
        let borg = this.fleet[i];
        grid.elements[borg].style.backgroundColor = this.color;
      }

      // Set the iteration interval
      this.id = setInterval(this.move, 120);
    }

    move() {
      // Check if the borg have made it to the bottom level
      const l = this.fleet.length;
      if (this.fleet[l - 1] >= (grid.limit * 24) &&
          this.fleet[l - 1] <= (grid.limit * 25)) this.gameOver = true;
      else if (l === 0) this.gameOver = true; // All borg have been removed

      // Or if they have collided with the player
      if (this.fleet.includes(player.index)) {
        this.gameOver = true;
      }

      // End the game if they have
      if (this.gameOver === true) {
        clearInterval(this.id);
        alert("Game over. Points: " +  scoreboard.points);
        location.reload();
      }

      // Find the limit of iteration to the right
      const rightLimit = [];
      for (let i = 1; i < 25; i++) rightLimit.push((i * grid.limit) - 1);

      // Find the limit of iteration to the left
      const leftLimit = [];
      leftLimit.push(0);
      for (let i = 1; i < 25; i++) leftLimit.push((i * grid.limit));

      // Remove previous level
      if (this.levelDown === true) {
        for (let i = 0; i < l; i++) {
          grid.elements[this.fleet[i] - grid.limit]
              .style.backgroundColor = grid.color;
          grid.elements[this.fleet[i]]
              .style.backgroundColor = grid.color;
          this.levelDown = false;
        }
      } else {
        for (let i = 0; i < l; i++) {
          if (this.fleet[i] !== undefined) {
            grid.elements[this.fleet[i]].style.backgroundColor = grid.color;
          }
        }
      }

      // Check if the borg fleet reached limit of iteration to the right
      for (let i = 0; i < l; i++) {
        const l_ = rightLimit.length;
        for (let j = 0; j < l_; j++) {
          if (this.fleet[i] === rightLimit[j] && this.moveRight === true) {
            this.levelDown = true;
          }
        }
      }

      // Check if the borg fleet reached limit of iteration to the left
      for (let i = 0; i < l; i++) {
        const l_ = leftLimit.length;
        for (let j = 0; j < l_; j++) {
          if (this.fleet[i] === leftLimit[j] && this.moveRight === false) {
            this.levelDown = true;
          }
        }
      }

      // Increment the borg fleet right
      if (this.moveRight === true) {
        for (let i = 0; i < l; i++) {
          if (this.levelDown === true) {
            this.moveRight = false;
            this.fleet[i] += grid.limit;
          } else this.fleet[i] += 1;
        }

      // Or increment them left
      } else {
        for (let i = 0; i < l; i++) {
          if (this.levelDown === true) {
            this.moveRight = true;
            this.fleet[i] += grid.limit;
          } else this.fleet[i] -= 1;
        }
      }

      // Draw the new level of the fleet
      for (let i = 0; i < l; i++) {
        if (this.fleet[i] !== undefined) {
          grid.elements[this.fleet[i]].style.backgroundColor = this.color;
        }
      }
    }
  }


// Objects _______________________________________________

  const grid = new Grid;
  const player = new Player;
  const borg = new Borg;
  const scoreboard = new Scoreboard;

  grid.create();
  player.create();
  borg.create();
  scoreboard.create();


// Event listeners _______________________________________________

  document.addEventListener('keydown', player.move);
  document.addEventListener('keydown', function(e) {
    const photonTorpedo = new PhotonTorpedo;
    if (event.keyCode === 32) photonTorpedo.create();
  });
})
