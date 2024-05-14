let canvas;
let ctx;
let fps = 50;

let widthF = 50;
let heightF = 50;

// COLORS
const red = "#ef1f1f";
const violet = "#940cb2";
const blue = "#203a9e";
const orange = "#e37b0e";
const brown = "#613b14";
const darkBrown = "#3a1700";
const green = "#044f14";
const ligthGreen = "#55cf23";
const golden = " #b29820";
const yellow = "#c6bc00";
const pink = "#db34ba";
const blueSky = "#348fdb";

// CHARACTERS IMAGES
let imgLink;
let imgAlien;
let imgWiz;

// CHARACTERS
let link, alien, wizard;

// MAP
let tileMap;

// ENEMIES
let enemies = [];

// TORCH
let torches = [];

// STAGE 10 x 15
let stage = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 2, 0, 0, 0, 2, 2, 2, 2, 0, 0, 2, 2, 0],
  [0, 0, 2, 2, 2, 2, 2, 0, 0, 2, 0, 0, 2, 0, 0],
  [0, 0, 2, 0, 0, 0, 2, 2, 0, 2, 2, 2, 2, 0, 0],
  [0, 0, 2, 2, 2, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0],
  [0, 2, 2, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0],
  [0, 0, 2, 0, 0, 0, 2, 2, 2, 0, 0, 2, 2, 2, 0],
  [0, 2, 2, 2, 0, 0, 2, 0, 0, 0, 1, 0, 0, 2, 0],
  [0, 2, 2, 3, 0, 0, 2, 0, 0, 2, 2, 2, 2, 2, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const printStage = () => {
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 15; x++) {
      let tile = stage[y][x];
      ctx.drawImage(
        tileMap,
        tile * 32,
        0,
        32,
        32,
        widthF * x,
        heightF * y,
        widthF,
        heightF
      );
    }
  }
};

class printTorch {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.delay = 10;
    this.count = 0;
    this.frame = 0;

    this.changeFrame = () => {
      if (this.frame < 3) {
        this.frame++;
      } else {
        this.frame = 0;
      }
    };

    this.print = () => {
      if (this.count < this.delay) {
        this.count++;
      } else {
        this.count = 0;
        this.changeFrame();
      }
      ctx.drawImage(
        tileMap,
        this.frame * 32,
        64,
        32,
        32,
        widthF * x,
        heightF * y,
        widthF,
        heightF
      );
    };
  }
}

const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
    image.src = src;
  });
};

class enemy {
  constructor({ x, y }) {
    this.x = x;
    this.y = y;
    this.delay = 20;
    this.frame = 0;

    // dirección aleatoria
    this.direction = Math.floor(Math.random() * 4);

    this.print = () => {
      ctx.drawImage(
        tileMap,
        0,
        32,
        32,
        32,
        this.x * widthF,
        this.y * heightF,
        widthF,
        heightF
      );
    };

    this.margin = (x, y) => {
      let breakpoint = false;
      if (stage[y][x] == 0) {
        breakpoint = true;
      }
      return breakpoint;
    };

    this.move = () => {
      wizard.fatality(this.x, this.y);
      if (this.count < this.delay) {
        this.count++;
      } else {
        this.count = 0;
        // up
        if (this.direction == 0) {
          if (!this.margin(this.x, this.y - 1)) {
            this.y--;
          } else {
            this.direction = Math.floor(Math.random() * 4);
          }
        }
        // down
        if (this.direction == 1) {
          if (!this.margin(this.x, this.y + 1)) {
            this.y++;
          } else {
            this.direction = Math.floor(Math.random() * 4);
          }
        }
        // left
        if (this.direction == 2) {
          if (!this.margin(this.x - 1, this.y)) {
            this.x--;
          } else {
            this.direction = Math.floor(Math.random() * 4);
          }
        }
        // right
        if (this.direction == 3) {
          if (!this.margin(this.x + 1, this.y)) {
            this.x++;
          } else {
            this.direction = Math.floor(Math.random() * 4);
          }
        }
      }
    };
  }
}

class character {
  constructor({ img }) {
    this.x = 1;
    this.y = 1;
    this.img = img;
    this.key = false;

    this.margin = (x, y) => {
      let breakpoint = false;
      if (stage[y][x] == 0) {
        breakpoint = true;
      }
      return breakpoint;
    };
    this.moveUp = () => {
      if (!this.margin(this.x, this.y - 1)) {
        this.y -= 1;
        this.interaction();
      }
    };
    this.moveDown = () => {
      if (!this.margin(this.x, this.y + 1)) {
        this.y += 1;
        this.interaction();
      }
    };
    this.moveLeft = () => {
      if (!this.margin(this.x - 1, this.y)) {
        this.x -= 1;
        this.interaction();
      }
    };
    this.moveRight = () => {
      if (!this.margin(this.x + 1, this.y)) {
        this.x += 1;
        this.interaction();
      }
    };

    this.victory = () => {
      alert("You completed the level! :)");
      this.x = 1;
      this.y = 1;
      this.llave = false;
      stage[8][3] = 3;
      stage[7][10] = 1;
    };

    this.dead = () => {
      alert("Haz perdido");
      this.x = 1;
      this.y = 1;
      this.llave = false;
      stage[8][3] = 3;
      stage[7][10] = 1;
    };

    this.fatality = (x, y) => {
      if (this.x == x && this.y == y) {
        this.dead();
      }
    };

    this.interaction = () => {
      let object = stage[this.y][this.x];

      // get the key
      if (object == 3) {
        this.llave = true;
        stage[this.y][this.x] = 2;
        alert("You have obtained a key!");
      }

      // open de door
      if (object == 1) {
        if (this.llave) {
          this.victory();
        } else {
          alert("Oh oh! You need a key");
        }
      }
    };

    this.print = () => {
      ctx.drawImage(this.img, this.x * widthF, this.y * heightF, 50, 50);
    };
  }
}

const createCharacters = () => {
  wizard = new character({ img: imgWiz });
};

// INITIALIZE FUNCTION
const main = () => {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  tileMap = new Image();
  tileMap.src = "./assets/maps/tilemap.png";

  const loadImages = [loadImage("./assets/characters/wizard.png")];

  Promise.all(loadImages)
    .then((images) => {
      imgWiz = images[0];
      createCharacters();
      setInterval(() => {
        startGame();
      }, 1000 / fps);
    })
    .catch((error) => {
      console.error("Error loading images:", error);
    });

  // create torches
  torches.push(new printTorch(0, 0));
  torches.push(new printTorch(9, 7));
  torches.push(new printTorch(11, 7));
  torches.push(new printTorch(14, 0));

  // create enemies
  enemies.push(new enemy({ x: 3, y: 3 }));
  enemies.push(new enemy({ x: 5, y: 7 }));
  enemies.push(new enemy({ x: 7, y: 7 }));

  document.addEventListener("keydown", (key) => {
    switch (key.key) {
      case "Space":
        return wizard.move(1);
      case "ArrowLeft":
        return wizard.moveLeft();
      case "ArrowUp":
        return wizard.moveUp();
      case "ArrowRight":
        return wizard.moveRight();
      case "ArrowDown":
        return wizard.moveDown();
      default:
        break;
    }
  });
};

// PRINCIPAL FUNCTION
const startGame = () => {
  printStage();
  wizard.print();
  for (let e = 0; e < enemies.length; e++) {
    enemies[e].print();
    enemies[e].move();
  }
  for (let e = 0; e < torches.length; e++) {
    torches[e].print();
  }
};
