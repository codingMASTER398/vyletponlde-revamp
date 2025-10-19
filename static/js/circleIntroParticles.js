function centerGush() {
  new particleEmitter({
    alpha: {
      start: 0.5,
      end: 0,
    },
    scale: {
      start: 0.1,
      end: 3,
      minimumScaleMultiplier: 1,
    },
    color: {
      r: 255,
      g: 255,
      b: 255,
    },
    speed: {
      start: 1000,
      end: -240,
      minimumSpeedMultiplier: 1,
    },
    speedMultiplier: {
      min: 0.3,
      max: 2,
    },
    startRotation: {
      min: 0,
      max: 360,
    },
    rotationSpeed: {
      min: -3,
      max: 3,
    },
    lifetime: {
      min: 0,
      max: 50,
    },
    frequency: 0.003,
    emitterLifetime: 0.1,
    easing: "easeOutCubic",
    x: windowWidth / 2,
    y: windowHeight / 2,
  });
}

function wingGush(right = false) {
  new particleEmitter({
    alpha: {
      start: 0.5,
      end: 0,
    },
    scale: {
      start: 6,
      end: 0,
      minimumScaleMultiplier: 1,
    },
    color: {
      r: 255,
      g: 155,
      b: 155,
    },
    speed: {
      start: 3000,
      end: -240,
      minimumSpeedMultiplier: 1,
    },
    speedMultiplier: {
      min: 0.3,
      max: 2,
    },
    startRotation: {
      min: 200 + (right ? 270 : 0),
      max: 250 + (right ? 270 : 0),
    },
    rotationSpeed: {
      min: -3,
      max: 3,
    },
    lifetime: {
      min: 0,
      max: 10,
    },
    frequency: 0.003,
    emitterLifetime: 0.1,
    easing: "easeOutCubic",
    x: right ? windowWidth : 0,
    y: windowHeight,
  });
}

function centerConstant() {
  new particleEmitter({
    alpha: {
      start: 0,
      end: 1,
    },
    scale: {
      start: 3,
      end: 0,
      minimumScaleMultiplier: 1,
    },
    color: {
      r: 255,
      g: 255,
      b: 255,
    },
    speed: {
      start: 1000,
      end: -1000,
      minimumSpeedMultiplier: 1,
    },
    speedMultiplier: {
      min: 0.3,
      max: 2,
    },
    startRotation: {
      min: 0,
      max: 360,
    },
    rotationSpeed: {
      min: -3,
      max: 3,
    },
    lifetime: {
      min: 0,
      max: 10,
    },
    frequency: 0.2,
    emitterLifetime: 100,
    easing: "easeOutCubic",
    x: windowWidth / 2,
    y: windowHeight / 2,
  });
}