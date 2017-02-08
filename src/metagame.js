(function () {
  'use strict';

  var Player = function (x, y, onFail, onComplete) {
    this.initialX = x;
    this.initialY = y
    this.onFail = onFail;
    this.onComplete = onComplete;
    this.reset();
  };

  Player.prototype.processMove = function (direction, callback) {
    switch (direction) {
      case 'up':
        this.y--;
        break;
      case 'down':
        this.y++;
        break;
      case 'left':
        this.x--;
        break;
      case 'right':
        this.x++;
        break;
      default: console.log('Invalid direction');
    }
    this.moves++;
    this.world.draw();
    if (this.world.map.collidesWithWall(this.getPosition())) {
      if (typeof (this.onFail) == 'function') {
        this.onFail();
      }
      this.world.status = 'failed';
      this.updateQueue.kill();
      this.world.reset();
    } else if (this.world.map.collidesWithGoal(this.getPosition())) {
      if (typeof (this.onComplete) == 'function') {
        this.onComplete(this.moves);
      }
      this.world.status = 'completed';
      this.updateQueue.kill();
      this.world.reset();
    } else {
      setTimeout(function () {
        callback();
      }, 500);
    }
  }

  Player.prototype.setWorld = function (world) {
    this.world = world;
  };

  Player.prototype.moveUp = function () {
    this.updateQueue.push('up');
  };

  Player.prototype.moveDown = function () {
    this.updateQueue.push('down');
  };

  Player.prototype.moveRight = function () {
    this.updateQueue.push('right');
  };

  Player.prototype.moveLeft = function () {
    this.updateQueue.push('left');
  };

  Player.prototype.stop = function () {
    this.updateQueue.kill();
    this.reset();
  };

  Player.prototype.getPosition = function () {
    return { x: this.x, y: this.y };
  };

  Player.prototype.reset = function () {
    this.x = this.initialX;
    this.y = this.initialY;
    this.moves = 0;
    this.updateQueue = async.queue($.proxy(function (direction, callback) {
      this.processMove(direction, callback);
    }, this), 1);
    this.updateQueue.drain = $.proxy(function () {
      if (this.world.status == 'running') {
        this.world.updateFunction(this.world.map, this.world.player);
      }
    }, this);
  };

  var Map = function (mapArray) {
    this.map = mapArray;
  };

  Map.prototype.collidesWithWall = function (position) {
    return this.map[position.y][position.x] == 1;
  };

  Map.prototype.collidesWithGoal = function (position) {
    return this.map[position.y][position.x] == 2;
  };

  Map.prototype.getArray = function () {
    return this.map;
  }

  var World = function (map, player, element) {
    this.map = map;
    this.player = player;
    this.element = element;
    this.player.setWorld(this);
    this.status = 'waiting';
  };

  World.prototype.begin = function (updateFunction) {
    if (this.status !== 'running') {
      this.draw();
      this.updateFunction = updateFunction;
      this.status = 'running';
      setTimeout($.proxy(function () {
        this.updateFunction(this.map, this.player);
      }, this), 500);
    }
  }

  World.prototype.getStatus = function () {
    return this.status;
  }

  World.prototype.reset = function () {
    this.player.reset();
    this.status = 'waiting';
  }

  World.prototype.stop = function () {
    this.player.stop();
    this.draw();
    this.status = 'waiting';
  }

  World.prototype.draw = function () {
    var mapText = '';
    var mapArray = this.map.getArray();
    for (var i = 0; i < mapArray.length; i++) {
      for (var j = 0; j < mapArray[i].length; j++) {
        var playerPosition = this.player.getPosition();
        if (playerPosition.y == i && playerPosition.x == j) {
          mapText += '@';
        } else if (mapArray[i][j] == 2) {
          mapText += '█';
        } else if (mapArray[i][j] == 1) {
          mapText += '#';
        } else if (mapArray[i][j] == 0) {
          mapText += '░';
        }
      }
      mapText += '\n';
    }
    this.element.text(mapText);
  }

  $.widget('custom.metaGame', {
    options: {
      map: [],
      playerInitialPosition: { x: 1, y: 1 },
      onFail: function () {
        alert('You fail');
      },
      onComplete: function () {
        alert('You win');
      }
    },
    _create: function () {
      this._world = new World(
        new Map(this.options.map),
        new Player(this.options.playerInitialPosition.x, this.options.playerInitialPosition.y, this.options.onFail, this.options.onComplete),
        $('<pre>').appendTo(this.element[0]));
    },

    begin: function (updateFunction) {
      this._world.begin(updateFunction);
    },

    stop: function () {
      this._world.stop();
    },

    _destroy: function () {

    }
  });

}).call(this);