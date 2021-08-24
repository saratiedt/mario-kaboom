kaboom({
  global: true,
  fullscreen: true,
  scale: 2,
  debug: true,
  clearColor: [0, 0, 0, 1],
});

const moveSpeed = 120;
const jumpForce = 360;
const bigJumpForce = 550;
let currentJumpForce = jumpForce;
const enemySpeed = 20;
const fallDeath = 500;

 // Game logic

let isJumping = true

loadRoot("https://i.imgur.com/");
loadSprite("coin", "wbKxhcd.png");
loadSprite("evil-shroom", "KPO3fR9.png");
loadSprite("brick", "pogC9x5.png");
loadSprite("block", "M6rwarW.png");
loadSprite("mario", "Wb1qfhK.png");
loadSprite("mushroom", "0wMd92p.png");
loadSprite("flower", "uaUm9sN.png");
loadSprite("surprise", "gesQ1KP.png");
loadSprite("unboxed", "bdrLpi6.png");
loadSprite("pipe-top-left", "ReTPiWY.png");
loadSprite("pipe-top-right", "hj2GK4n.png");
loadSprite("pipe-bottom-left", "c1cYSbt.png");
loadSprite("pipe-bottom-right", "nqQ79eI.png");

loadSprite("blue-block", "fVscIbn.png");
loadSprite("blue-brick", "3e5YRQd.png");
loadSprite("blue-steel", "gqVoI2b.png");
loadSprite("blue-evil-shroom", "SvV4ueD.png");
loadSprite("blue-surprise", "RMqCc1G.png");

scene("game", ({ level, score }) => {
  layers(["bg", "obj", "ui"], "obj");

  const maps = [
    [
      "                                      ",
      "                                      ",
      "                                      ",
      "                                      ",
      "                                      ",
      "                                      ",
      "     %   =*=%=                        ",
      "                             -+       ",
      "                /    ^   ^   ()     / ",
      "===============================   ====",
    ],
    [
        ";                                     ",
        ";                                     ",
        ";                                     ",
        ";                                     ",
        ";                                     ",
        ";                   /                 ",
        ";     %   =*%%***=%==                 ",
        ";                            ;      -+",
        ";           /    /        ^  ; ; /  ()",
        ";=============================   =====",
      ],
    [
      "£                                       £",
      "£                                       £",
      "£                                       £",
      "£                                       £",
      "£                                       £",
      "£        @@@@@@              x x        £",
      "£                          x x x        £",
      "£                        x x x x  x   -+£",
      "£               z   z  x x x x x  x   ()£",
      "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
    ],
  ];

  const levelCfg = {
    width: 20,
    height: 20,
    "=": [sprite("block"), solid()],
    ";": [sprite("brick"), solid()],
    '$': [sprite("coin"), "coin"],
    "%": [sprite("surprise"), solid(), "coin-surprise"],
    "*": [sprite("surprise"), solid(), "mushroom-surprise"],
    "}": [sprite("unboxed"), solid()],
    "(": [sprite("pipe-bottom-left"), solid(), scale(0.5)],
    ")": [sprite("pipe-bottom-right"), solid(), scale(0.5)],
    "-": [sprite("pipe-top-left"), solid(), scale(0.5), "pipe"],
    "+": [sprite("pipe-top-right"), solid(), scale(0.5), "pipe"],
    "^": [sprite("evil-shroom"), solid(), "dangerous", body()],
    "#": [sprite("mushroom"), solid(), "mushroom", body()],
    "/": [sprite('flower')],
    "!": [sprite("blue-block"), solid(), scale(0.5)],
    "£": [sprite("blue-brick"), solid(), scale(0.5)],
    'z': [sprite("blue-evil-shroom"), solid(), scale(0.5), "dangerous", body()],
    "@": [sprite("blue-surprise"), solid(), scale(0.5), "coin-surprise"],
    'x': [sprite("blue-steel"), solid(), scale(0.5)],
  };

  // config

  const gameLevel = addLevel(maps[level], levelCfg);

  const scoreLabel = add([
    text(score),
    pos(30, 6),
    layer('ui'),
    {
      value: score,
    }
  ])


  add([text("level " + parseInt(level + 1)), pos(40, 6)]);

  function big() {
    let timer = 1;
    let isBig = false;
    return {
      update() {
        if (isBig) {
          timer -= dt();
          if (timer <= 0) {
            this.smallify();
          }
        }
      },
      isBig() {
        return isBig;
      },
      smallify() {
        this.scale = vec2(1, 1);
        currentJumpForce = jumpForce;
        timer = 0;
        isBig = false;
      },
      biggify(time) {
        this.scale = vec2(2);
        currentJumpForce = bigJumpForce;
        timer = time;
        isBig = true;
      },
    };
  }

  const player = add([
    sprite("mario"),
    solid(),
    pos(30, 0),
    body(),
    big(),
    origin("bot"),
  ]);

  action("mushroom", (mushroom) => {
    mushroom.move(20, 0);
  });

  action("dangerous", (dangerous) => {
    dangerous.move(-enemySpeed, 0);
  });

  // events

  player.on("headbump", (obj) => {
    if (obj.is("coin-surprise")) {
      gameLevel.spawn("$", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("}", obj.gridPos.sub(0, 0));
    }
    if (obj.is("mushroom-surprise")) {
      gameLevel.spawn("#", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("}", obj.gridPos.sub(0, 0));
    }
  });

  player.collides("mushroom", (mushroom) => {
    destroy(mushroom);
    player.biggify(6);
  });

  player.collides("coin", (coin) => {
    destroy(coin);
    scoreLabel.value++;
    scoreLabel.text = scoreLabel.value;
  });

  player.collides('dangerous', (d) => {
    if (isJumping) {
      destroy(d)
    } else {
      go('lose', { score: scoreLabel.value})
    }
  })

  player.action(() => {
    camPos(player.pos);
    if (player.pos.y >= fallDeath) {
      go("lose", { score: scoreLabel.value });
    }
  });

  player.collides("pipe", () => {
    keyPress("down", () => {
      go("game", {
        level: (level + 1) % maps.length,
        score: scoreLabel.value,
      });
    });
  });

  // actions

  keyDown("right", () => {
    player.move(moveSpeed, 0);
  });

  keyDown("left", () => {
    player.move(-moveSpeed, 0);
  });

  player.action(() => {
    if(player.grounded()) {
      isJumping = false
    }
  })

  keyPress("space", () => {
    if (player.grounded()) {
      isJumping = true;
      player.jump(currentJumpForce);
    }
  });
});

scene("lose", ({ score }) => {
  add([text(score, 32), origin("center"), pos(width() / 2, height() / 2)]);
});

start("game", { level: 0, score: 0 });
