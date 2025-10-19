function translateAndRotate(x, y, offsetX, offsetY, rotation) {
  // Convert rotation to radians
  const radians = (rotation * Math.PI) / 180;

  // Apply rotation to offset
  const rotatedOffsetX =
    offsetX * Math.cos(radians) - offsetY * Math.sin(radians);
  const rotatedOffsetY =
    offsetX * Math.sin(radians) + offsetY * Math.cos(radians);

  // Translate the point
  const newX = x + rotatedOffsetX;
  const newY = y + rotatedOffsetY;

  return { newX, newY };
}

function interpolateColor(color1, color2, percent) {
  // Interpolate the RGB values
  const r = Math.round(color1.r + (color2.r - color1.r) * percent);
  const g = Math.round(color1.g + (color2.g - color1.g) * percent);
  const b = Math.round(color1.b + (color2.b - color1.b) * percent);

  // Convert the interpolated RGB values back to a hex color
  return {
    r,
    g,
    b,
  };
}

function pastel_colour() {
  let baseRed = 158;
  let baseGreen = 158;
  let baseBlue = 158;

  let seed = Math.random() * 200;
  let rand_1 = Math.abs(Math.sin(seed++) * 10000) % 256;
  let rand_2 = Math.abs(Math.sin(seed++) * 10000) % 256;
  let rand_3 = Math.abs(Math.sin(seed++) * 10000) % 256;

  //build colour
  let red = Math.round((rand_1 + baseRed) / 2);
  let green = Math.round((rand_2 + baseGreen) / 2);
  let blue = Math.round((rand_3 + baseBlue) / 2);

  return { r: red, g: green, b: blue };
}

const interpolators = {
  // Linear interpolation (default)
  default: (value1, value2, frac) => {
    return value1 + (value2 - value1) * frac;
  },

  // Ease Out Circular
  easeOutCirc: (value1, value2, frac) => {
    return value1 + (value2 - value1) * Math.sqrt(1 - Math.pow(frac - 1, 2));
  },

  // Ease In Circular
  easeInCirc: (value1, value2, frac) => {
    return value1 + (value2 - value1) * (1 - Math.sqrt(1 - Math.pow(frac, 2)));
  },

  // Ease Out Cubic
  easeOutCubic: (value1, value2, frac) => {
    return value1 + (value2 - value1) * (1 - Math.pow(1 - frac, 3));
  },

  // Ease In Cubic
  easeInCubic: (value1, value2, frac) => {
    return value1 + (value2 - value1) * Math.pow(frac, 3);
  },
};

const camera = {
  x: 0,
  y: 0,
  zoom: 1,
};

class _particle {
  constructor(opts) {
    this.spawned = performance.now();
    this.lifetime = random(opts.lifetime.min, opts.lifetime.max) * 1000;

    this.interpolator = interpolators[opts.easing || "default"];

    this.x = opts.x;
    this.y = opts.y;
    this.opts = opts;

    this.rotation = random(opts.startRotation.min, opts.startRotation.max);
    if (Math.random() > 0.7) this.rotation += random(-80, 80);
    this.rotationSpeed = random(opts.rotationSpeed.min, opts.rotationSpeed.max);
    this.speedMultiplier = random(
      opts.speedMultiplier.min,
      opts.speedMultiplier.max
    );
    this.extraRotation = random(0, 360);

    if (this.opts.color.min) {
      this.colorStart = interpolateColor(
        this.opts.color.min.start,
        this.opts.color.max.start,
        Math.random()
      );
      this.colorEnd = interpolateColor(
        this.opts.color.min.end,
        this.opts.color.max.end,
        Math.random()
      );
    } else if (this.opts.color == "pastel") {
      this.colorStart = pastel_colour();
      this.colorEnd = pastel_colour();
    } else {
      this.colorStart = this.opts.color;
      this.colorEnd = this.opts.color;
    }

    particles.push(this);
  }
  draw() {
    let percentageDone = (performance.now() - this.spawned) / this.lifetime,
      alpha = interpolators["default"](
        this.opts.alpha.start,
        this.opts.alpha.end,
        percentageDone
      ),
      _color = interpolateColor(this.colorStart, this.colorEnd, percentageDone),
      scale = interpolators["default"](
        this.opts.scale.start,
        this.opts.scale.end,
        percentageDone
      );

    if (percentageDone > 1) {
      particles = particles.filter((p) => p != this);
      return;
    }

    let translated = translateAndRotate(
      this.x,
      this.y,
      0,
      (this.interpolator(
        this.opts.speed.start,
        this.opts.speed.end,
        percentageDone
      ) /
        200) *
        this.speedMultiplier *
        (1 || deltaMult), // "deltaMult" is defined... somewhere else in the game
      this.rotation
    );

    this.x = translated.newX;
    this.y = translated.newY;

    /*if (!isVisible(this.x, this.y)) {
        return;
      }*/

    this.extraRotation += this.rotationSpeed * (1 || deltaMult);

    let ox = (this.x - camera.x) * camera.zoom,
      oy = (this.y - camera.y) * camera.zoom;

    if (this.opts.scaleDown) scale *= 0.2;

    translate(ox, oy);
    fill(_color.r, _color.g, _color.b, alpha * 255);
    rotate(this.rotation + this.extraRotation);
    rect(0, 0, scale * 20, scale * 20);

    rotate(-(this.rotation + this.extraRotation));
    translate(-ox, -oy);
    //scale(1 / zoom)

    //pop()
  }
}

window._particle = _particle;

window.particleEmitters = [];

class particleEmitter {
  constructor(opts) {
    window.particleEmitters.push(this);

    opts.frequency = opts.frequency * 1000;

    this.opts = opts;
    this.lastParticle = performance.now();

    this.startTime = performance.now();

    //this.opts.frequency /= window.options.particlesAmount;
    this.opts.frequency /= 1;
  }
  draw() {
    let ending =
      performance.now() - this.startTime > this.opts.emitterLifetime * 1000;

    if (ending) {
      // cull the emitter
      window.particleEmitters = window.particleEmitters.filter(
        (p) => p != this
      );
      return;
    }

    /*if(this.opts.updPos){
            let {x,y,rotMin,rotMax} = this.opts.updPos();
            this.opts.x = x;
            this.opts.y = y;
            this.opts.startRotation.min = rotMin;
            this.opts.startRotation.max = rotMax;
        }*/

    // add new particles
    let freqToAdd = performance.now() - this.lastParticle;

    while (freqToAdd > this.opts.frequency) {
      freqToAdd -= this.opts.frequency;

      if (
        //isVisible({
        //  x: this.opts.x,
        //  y: this.opts.y,
        //})
        true
      ) {
        new _particle({
          ...this.opts,
        });

        for (let i = 0; i < 3; i++) {
          new _particle({
            ...this.opts,
            scaleDown: true,
          });
        }
      }

      this.lastParticle = performance.now() - freqToAdd;
    }

    //this.drawParticles();
  }
}

window.explosionParticles = (o) => {
  //let hm = new Sprite(o.x, o.y, o.radius, "none")
  //hm.life = 100;

  let radMult = o.radius / 150,
    directionMin = 0,
    directionMax = 360;

  if (o.wind && !isNaN(o.wind)) {
    directionMin = o.wind - 40;
    directionMax = o.wind + 40;
  }

  new particleEmitter({
    x: o.x,
    y: o.y,
    //"easing": "easeOutCubic",
    alpha: {
      start: 1,
      end: 0,
    },
    scale: {
      start: o.intensity * 1.5,
      end: o.intensity * 3.5,
      minimumScaleMultiplier: 0,
    },
    color: {
      min: {
        start: o.colorStart ||
          o.color || {
            r: 150,
            g: 0,
            b: 0,
          },
        end: o.colorEnd ||
          o.color || {
            r: 255,
            g: 230,
            b: 0,
          },
      },
      max: {
        start: o.colorStart ||
          o.color || {
            r: 255,
            g: 0,
            b: 0,
          },
        end: o.colorEnd ||
          o.color || {
            r: 255,
            g: 50,
            b: 50,
          },
      },
    },
    speed: {
      start: 350 * radMult,
      end: -100 * radMult,
      minimumSpeedMultiplier: 1,
    },
    speedMultiplier: {
      min: 0,
      max: 1,
    },
    startRotation: {
      min: directionMin,
      max: directionMax,
    },
    rotationSpeed: {
      min: -2,
      max: 2,
    },
    lifetime: {
      min: 0.1 + (o.extraTime || 0),
      max: o.intensity * 3 + (o.extraTime || 0),
    },
    frequency: o.frequency / 2500,
    emitterLifetime: 0.1,
  });
};

particles = [];
