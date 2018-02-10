var ParticleScene = function(el) {
    this.viewport = el;
    this.world = document.createElement('div');
    this.particles = [];

    this.options = {
      numParticles: 20,  //20 for leaves
      wind: {
        magnitude: 1.2,  //1.2 for leaves
        maxSpeed: 12,  //12 for leaves
        duration: 300,
        start: 0,
        speed: 0
      },
    };

    this.width = this.viewport.offsetWidth;
    this.height = this.viewport.offsetHeight;

    // animation helper
    this.timer = 0;

    this._resetParticle = function(particle) {
		//if (pause==0 && stopped==0) {
		  // place particle towards the top left
		  particle.x = this.width * 2 - Math.random()*this.width*1.75;
		  particle.y = -10;
		  particle.z = Math.random()*200;	//200 for leaves
		  if (particle.x > this.width) {
			particle.x = this.width + 10;
			particle.y = Math.random()*this.height/2;
		  }
		  // at the start, the particle can be anywhere
		  if (this.timer == 0) {
			particle.y = Math.random()*this.height;
		  }

		  // Choose axis of rotation.
		  // If axis is not X, chose a random static x-rotation for greater variability
		  particle.rotation.speed = Math.random()*10;
		  var randomAxis = Math.random();
		  if (randomAxis > 0.5) {
			particle.rotation.axis = 'X';
		  } else if (randomAxis > 0.25) {
			particle.rotation.axis = 'Y';
			particle.rotation.x = Math.random()*180 + 90;
		  } else {
			particle.rotation.axis = 'Z';
			particle.rotation.x = Math.random()*360 - 180;
			// looks weird if the rotation is too fast around this axis
			particle.rotation.speed = Math.random()*3;
		  }

		  // random speed
		  particle.xSpeedVariation = Math.random() * 0.8 - 0.4;
		  particle.ySpeed = Math.random() + 1.5;
		//}
      return particle;
    }

    this._updateParticle = function(particle) {
		if (pause==0 && stopped==0) {
		  var particleWindSpeed = this.options.wind.speed(this.timer - this.options.wind.start, particle.y);

		  var xSpeed = particleWindSpeed + particle.xSpeedVariation;
		  particle.x -= xSpeed;
		  particle.y += particle.ySpeed;
		  particle.rotation.value += particle.rotation.speed;

		  var t = 'translateX( ' + particle.x + 'px ) translateY( ' + particle.y + 'px ) translateZ( ' + particle.z + 'px )  rotate' + particle.rotation.axis + '( ' + particle.rotation.value + 'deg )';
		  if (particle.rotation.axis !== 'X') {
			t += ' rotateX(' + particle.rotation.x + 'deg)';
		  }
		  particle.el.style.webkitTransform = t;
		  particle.el.style.MozTransform = t;
		  particle.el.style.oTransform = t;
		  particle.el.style.transform = t;

		  // reset if out of view
		  if (particle.x < -10 || particle.y > this.height + 10) {
			this._resetParticle(particle);
		  }
		}
    }

    this._updateWind = function() {
      // wind follows a sine curve: asin(b*time + c) + a
      // where a = wind magnitude as a function of particle position, b = wind.duration, c = offset
      // wind duration should be related to wind magnitude, e.g. higher windspeed means longer gust duration
		//if (pause==0 && stopped==0) {
		  if (this.timer === 0 || this.timer > (this.options.wind.start + this.options.wind.duration)) {

			this.options.wind.magnitude = Math.random() * this.options.wind.maxSpeed;
			this.options.wind.duration = this.options.wind.magnitude * 50 + (Math.random() * 20 - 10);
			this.options.wind.start = this.timer;

			var screenHeight = this.height;

			this.options.wind.speed = function(t, y) {
			  // should go from full wind speed at the top, to 1/2 speed at the bottom, using particle Y
			  var a = this.magnitude/2 * (screenHeight - 2*y/3)/screenHeight;
			  return a * Math.sin(2*Math.PI/this.duration * t + (3 * Math.PI/2)) + a;
			}
		  }
		//}  
    }
  }

  ParticleScene.prototype.init = function() {

    for (var i = 0; i < this.options.numParticles; i++) {
      var particle = {
        el: document.createElement('div'),
        x: 0,
        y: 0,
        z: 0,
        rotation: {
          axis: 'X',
          value: 0,
          speed: 0,
          x: 0
        },
        xSpeedVariation: 0,
        ySpeed: 0,
        path: {
          type: 1,
          start: 0,

        },
        image: 1
      };
      this._resetParticle(particle);
      this.particles.push(particle);
      this.world.appendChild(particle.el);
    }

    this.world.className = 'particle-scene';
    this.viewport.appendChild(this.world);

    // set perspective
    this.world.style.webkitPerspective = "400px";
    this.world.style.MozPerspective = "400px";
    this.world.style.oPerspective = "400px";
    this.world.style.perspective = "400px";
    
    // reset window height/width on resize
    var self = this;
    window.onresize = function(event) {
      self.width = self.viewport.offsetWidth;
      self.height = self.viewport.offsetHeight;
    };
  }

  ParticleScene.prototype.render = function() {
	  //if (pause==0 && stopped==0) {
		this._updateWind();
		for (var i = 0; i < this.particles.length; i++) {
		  this._updateParticle(this.particles[i]);
		}

		this.timer++;

		requestAnimationFrame(this.render.bind(this));
	 // }
  }

  // start up particle scene
  var particleContainer = document.querySelector('.falling-particles'),
      particles = new ParticleScene(particleContainer);

  particles.init();
  particles.render();