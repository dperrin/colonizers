(function() {
    var playerStateLoaded = false;
    var whoseTurn = null;
    var myColor = null;
    var roll = 0;

    var gameId = window.location.href.split('/').pop();
    var socket = io({
        query: { gameId: gameId }
    });

    $('#roll-button').click(function() {
        socket.emit('roll');
    });

    $('#end-turn-button').click(function() {
        socket.emit('end_turn');
    });

    var imageWidth = 138;
    var imageHeight = 160;

    var hillsDeferred = $.Deferred();
    var forestDeferred = $.Deferred();
    var mountainsDeferred = $.Deferred();
    var fieldsDeferred = $.Deferred();
    var pastureDeferred = $.Deferred();
    var desertDeferred = $.Deferred();

    var loaders = [hillsDeferred, forestDeferred, mountainsDeferred, fieldsDeferred, pastureDeferred, desertDeferred];

    var hillsImage = new Image();
    hillsImage.onload = function() {
        hillsDeferred.resolve();
    };
    hillsImage.src = "resources/hex-hills.png";

    var forestImage = new Image();
    forestImage.onload = function() {
        forestDeferred.resolve();
    };
    forestImage.src = "resources/hex-forest.png";

    var mountainsImage = new Image();
    mountainsImage.onload = function() {
        mountainsDeferred.resolve();
    };
    mountainsImage.src = "resources/hex-mountains.png";

    var fieldsImage = new Image();
    fieldsImage.onload = function() {
        fieldsDeferred.resolve();
    };
    fieldsImage.src = "resources/hex-fields.png";

    var pastureImage = new Image();
    pastureImage.onload = function() {
        pastureDeferred.resolve();
    };
    pastureImage.src = "resources/hex-pasture.png";

    var desertImage = new Image();
    desertImage.onload = function() {
        desertDeferred.resolve();
    };
    desertImage.src = "resources/hex-desert.png";

    $.when.apply(null, loaders).done(function() {
        drawBoard();
        socket.emit('get_game_state');
        socket.emit('get_player_state');
    });

    var updateTurnIndicator = function() {
        if (whoseTurn && playerStateLoaded) {
            $(".turn-indicator-red").hide();
            $(".turn-indicator-blue").hide();
            $(".turn-indicator-orange").hide();
            $(".turn-indicator-black").hide();
            $(".turn-indicator-" + whoseTurn).show();
        }
    }

    var updateButtonStates = function() {
        // it is not my turn
        if (whoseTurn !== myColor) {
            $('#roll-button').prop("disabled", true);
            $('#end-turn-button').prop("disabled", true);
            return;
        } 
        
        // it is my turn
        if (roll) {
            $('#roll-button').prop("disabled", true);
            $('#end-turn-button').prop("disabled", false);
            return;
        }

        if (!roll) {
            $('#roll-button').prop("disabled", false);
            $('#end-turn-button').prop("disabled", true);
            return;
        }
    }

    var buildPlayerInfoBox = function(color) {
        var playerDiv = $(document.createElement("div"));
        $("<span/>").addClass("turn-indicator-" + color).text("->").appendTo(playerDiv).hide();
        playerDiv.addClass("player-info");
        playerDiv.css("background-color", color);

        var list = document.createElement("ul");
        list.className = "resources";

        var woodCounter = $("<li/>").addClass("wood-counter").text("wood: 0").appendTo(list);
        var woolCounter = $("<li/>").addClass("wool-counter").text("wool: 0").appendTo(list);
        var clayCounter = $("<li/>").addClass("clay-counter").text("clay: 0").appendTo(list);
        var wheatCounter = $("<li/>").addClass("wheat-counter").text("wheat: 0").appendTo(list);
        var oreCounter = $("<li/>").addClass("ore-counter").text("ore: 0").appendTo(list);

        playerDiv.append(list);

        $('#players').append(playerDiv);
    };

    var updatePlayerInfoBox = function(playerState) {
        $(".player-info .wood-counter").text("wood: " + playerState.wood);
        $(".player-info .wool-counter").text("wool: " + playerState.wool);
        $(".player-info .clay-counter").text("clay: " + playerState.clay);
        $(".player-info .wheat-counter").text("wheat: " + playerState.wheat);
        $(".player-info .ore-counter").text("ore: " + playerState.ore);
    }

    var buildOpponentInfoBox = function(color) {
        var playerDiv = $(document.createElement("div"));
        $("<span/>").addClass("turn-indicator-" + color).text("->").appendTo(playerDiv).hide();
        playerDiv.addClass("opponent-info");
        playerDiv.css("background-color", color);

        var list = document.createElement("ul");
        list.className = "resources";

        var victoryPoints = $("<li/>").text(color).appendTo(list);

        playerDiv.append(list);

        $('#players').append(playerDiv);
    };

    var getImage = function(resourceName) {
        switch (resourceName) {
            case "wheat": return fieldsImage;
            case "clay": return hillsImage;
            case "wool": return pastureImage;
            case "ore": return mountainsImage;
            case "wood": return forestImage;
            default: return desertImage;
        }
    }

    var updateRollDisplay = function(rollValue) {
        if (rollValue === 0) {
            $("#roll").text('');
        } else {
            $("#roll").text(roll);
        }
        
    }

    socket.on('player_state', function(playerState) {
        myColor = playerState.color;

        if (!playerStateLoaded) {
            "red" === myColor ? buildPlayerInfoBox("red") : buildOpponentInfoBox("red");
            "blue" === myColor ? buildPlayerInfoBox("blue") : buildOpponentInfoBox("blue");
            "orange" === myColor ? buildPlayerInfoBox("orange") : buildOpponentInfoBox("orange");
            "black" === myColor ? buildPlayerInfoBox("black") : buildOpponentInfoBox("black");
            playerStateLoaded = true;
        }

        console.log(playerState);
        updatePlayerInfoBox(playerState);
        updateTurnIndicator();
        updateButtonStates();
    });

    var drawBoard = function() {
        var canvas = document.getElementById("game");
        var ctx = canvas.getContext("2d");
        canvas.width  = imageWidth * 5;
        canvas.height = (imageHeight - 42) * 5 + 42;
        ctx.font = "24px Comic Sans MS";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
    
        socket.on('game_state', function(gameState) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            console.log(gameState);

            whoseTurn = gameState.turn;
            roll = gameState.roll;
            updateRollDisplay(roll);

            updateTurnIndicator();
            updateButtonStates();
    
            var getHexAttribute = function(position, attribute, falseyValue) {
                return gameState.board.find(function(element) {
                    return element.position === position;
                })[attribute] || falseyValue;
            }
    
            /*
             * Draw Hex Tiles
             */
            var firstRowHorizontal = canvas.width/2 - imageWidth/2 - imageWidth;
            var firstRowHorizontalText = firstRowHorizontal + imageWidth/2;
            var firstRowVertical = 0;
            var firstRowVerticalText = firstRowVertical + imageHeight/2 + 10;
    
            ctx.drawImage(getImage(getHexAttribute(0, 'resource')), firstRowHorizontal, firstRowVertical);
            ctx.fillText(getHexAttribute(0, 'number', '') + '', firstRowHorizontalText, firstRowVerticalText);
            ctx.drawImage(getImage(getHexAttribute(1, 'resource')), firstRowHorizontal + imageWidth, firstRowVertical);
            ctx.fillText(getHexAttribute(1, 'number', '') + '', firstRowHorizontalText + imageWidth, firstRowVerticalText);
            ctx.drawImage(getImage(getHexAttribute(2, 'resource')), firstRowHorizontal + imageWidth * 2, firstRowVertical);
            ctx.fillText(getHexAttribute(2, 'number', '') + '', firstRowHorizontalText + imageWidth * 2, firstRowVerticalText);
    
            var secondRowHoritzonal = canvas.width/2 - imageWidth * 2;
            var secondRowHorizontalText = secondRowHoritzonal + imageWidth/2;
            var secondRowVertical = imageHeight - 42;
            var secondRowVerticalText = secondRowVertical + imageHeight/2 + 10;
    
            ctx.drawImage(getImage(getHexAttribute(3, 'resource')), secondRowHoritzonal, secondRowVertical);
            ctx.fillText(getHexAttribute(3, 'number', '') + '', secondRowHorizontalText, secondRowVerticalText);
            ctx.drawImage(getImage(getHexAttribute(4, 'resource')), secondRowHoritzonal + imageWidth, secondRowVertical);
            ctx.fillText(getHexAttribute(4, 'number', '') + '', secondRowHorizontalText + imageWidth, secondRowVerticalText);
            ctx.drawImage(getImage(getHexAttribute(5, 'resource')), secondRowHoritzonal + imageWidth * 2, secondRowVertical);
            ctx.fillText(getHexAttribute(5, 'number', '') + '', secondRowHorizontalText + imageWidth * 2, secondRowVerticalText);
            ctx.drawImage(getImage(getHexAttribute(6, 'resource')), secondRowHoritzonal + imageWidth * 3, secondRowVertical);
            ctx.fillText(getHexAttribute(6, 'number', '') + '', secondRowHorizontalText + imageWidth * 3, secondRowVerticalText);
    
            var thirdRowHorizontal = canvas.width/2 - imageWidth/2 - imageWidth * 2;
            var thirdRowHorizontalText = thirdRowHorizontal + imageWidth/2;
            var thirdRowVertical = (imageHeight - 42) * 2;
            var thirdRowVerticalText = thirdRowVertical + imageHeight/2 + 10;
    
            ctx.drawImage(getImage(getHexAttribute(7, 'resource')), thirdRowHorizontal, thirdRowVertical);
            ctx.fillText(getHexAttribute(7, 'number', '') + '', thirdRowHorizontalText, thirdRowVerticalText);
            ctx.drawImage(getImage(getHexAttribute(8, 'resource')), thirdRowHorizontal + imageWidth, thirdRowVertical);
            ctx.fillText(getHexAttribute(8, 'number', '') + '', thirdRowHorizontalText + imageWidth, thirdRowVerticalText);
            ctx.drawImage(getImage(getHexAttribute(9, 'resource')), thirdRowHorizontal + imageWidth * 2, thirdRowVertical);
            ctx.fillText(getHexAttribute(9, 'number', '') + '', thirdRowHorizontalText+ imageWidth * 2, thirdRowVerticalText);
            ctx.drawImage(getImage(getHexAttribute(10, 'resource')), thirdRowHorizontal + imageWidth * 3, thirdRowVertical);
            ctx.fillText(getHexAttribute(10, 'number', '') + '', thirdRowHorizontalText + imageWidth * 3, thirdRowVerticalText);
            ctx.drawImage(getImage(getHexAttribute(11, 'resource')), thirdRowHorizontal + imageWidth * 4, thirdRowVertical);
            ctx.fillText(getHexAttribute(11, 'number', '') + '', thirdRowHorizontalText + imageWidth * 4, thirdRowVerticalText);
    
            var fourthRowVertical = (imageHeight - 42) * 3;
            var fourthRowVerticalText = fourthRowVertical + imageHeight/2 + 10;
    
            ctx.drawImage(getImage(getHexAttribute(12, 'resource')), secondRowHoritzonal, fourthRowVertical);
            ctx.fillText(getHexAttribute(12, 'number', '') + '', secondRowHorizontalText, fourthRowVerticalText);
            ctx.drawImage(getImage(getHexAttribute(13, 'resource')), secondRowHoritzonal + imageWidth, fourthRowVertical);
            ctx.fillText(getHexAttribute(13, 'number', '') + '', secondRowHorizontalText + imageWidth, fourthRowVerticalText);
            ctx.drawImage(getImage(getHexAttribute(14, 'resource')), secondRowHoritzonal + imageWidth * 2, fourthRowVertical);
            ctx.fillText(getHexAttribute(14, 'number', '') + '', secondRowHorizontalText + imageWidth * 2, fourthRowVerticalText);
            ctx.drawImage(getImage(getHexAttribute(15, 'resource')), secondRowHoritzonal + imageWidth * 3, fourthRowVertical);
            ctx.fillText(getHexAttribute(15, 'number', '') + '', secondRowHorizontalText + imageWidth * 3, fourthRowVerticalText);
    
            var fifthRowVertical = (imageHeight - 42) * 4;
            var fifthRowVerticalText = fifthRowVertical + imageHeight/2 + 10;
    
            ctx.drawImage(getImage(getHexAttribute(16, 'resource')), firstRowHorizontal, fifthRowVertical);
            ctx.fillText(getHexAttribute(16, 'number', '') + '', firstRowHorizontalText, fifthRowVerticalText);
            ctx.drawImage(getImage(getHexAttribute(17, 'resource')), firstRowHorizontal + imageWidth, fifthRowVertical);
            ctx.fillText(getHexAttribute(17, 'number', '') + '', firstRowHorizontalText + imageWidth, fifthRowVerticalText);
            ctx.drawImage(getImage(getHexAttribute(18, 'resource')), firstRowHorizontal + imageWidth * 2, fifthRowVertical);
            ctx.fillText(getHexAttribute(18, 'number', '') + '', firstRowHorizontalText + imageWidth * 2, fifthRowVerticalText);
    
            /*
             * Roads - Drawn before cities so that they will be below the other graphics
             */
            gameState.roads.forEach(function(road) {
                var startPosition;
                var endPosition;
    
                // find the correct tile to based positioning on
                var tile = gameState.board.find(function(gameTile) {
                    for (var i = 0; i < gameTile.indexes.length; i++) {
                        if (gameTile.indexes[i][0] === road.start[0] && gameTile.indexes[i][1] === road.start[1]) {
                            return true;
                        }
                    }

                    return false;
                });

                // find the start and end positions
                for (var i = 0; i < tile.indexes.length; i++) {
                    if (tile.indexes[i][0] === road.start[0] && tile.indexes[i][1] === road.start[1]) {
                        startPosition = i;
                        // console.log(road.start + ' is ' + startPosition + ' in ' + JSON.stringify(tile));
                    }
                    if (tile.indexes[i][0] === road.end[0] && tile.indexes[i][1] === road.end[1]) {
                        endPosition = i;
                        // console.log(road.end + ' is ' + endPosition + ' in ' + JSON.stringify(tile));
                    }
                }
    
                if (tile.position >= 0 && tile.position < 3) {
                    drawRoad.apply(this, [
                        ...getRoadPositionCoordinates(startPosition, firstRowHorizontal + imageWidth * tile.position, firstRowVertical), 
                        ...getRoadPositionCoordinates(endPosition, firstRowHorizontal + imageWidth * tile.position, firstRowVertical),
                        road.color
                    ]);
                } else if (tile.position >= 3 && tile.position < 7) {
                    drawRoad.apply(this, [
                        ...getRoadPositionCoordinates(startPosition, secondRowHoritzonal + imageWidth * (tile.position - 3), secondRowVertical),
                        ...getRoadPositionCoordinates(endPosition, secondRowHoritzonal + imageWidth * (tile.position - 3), secondRowVertical),
                        road.color
                    ]);
                } else if (tile.position >= 7 && tile.position < 12) {
                    drawRoad.apply(this, [
                        ...getRoadPositionCoordinates(startPosition, thirdRowHorizontal + imageWidth * (tile.position - 7), thirdRowVertical), 
                        ...getRoadPositionCoordinates(endPosition, thirdRowHorizontal + imageWidth * (tile.position - 7), thirdRowVertical),
                        road.color
                    ]);
                } else if (tile.position >= 12 && tile.position < 16) {
                    drawRoad.apply(this, [
                        ...getRoadPositionCoordinates(startPosition, secondRowHoritzonal + imageWidth * (tile.position - 12), fourthRowVertical),
                        ...getRoadPositionCoordinates(endPosition, secondRowHoritzonal + imageWidth * (tile.position - 12), fourthRowVertical),
                        road.color
                    ]);
                } else if (tile.position >= 16 && tile.position < 19) {
                    drawRoad.apply(this, [
                        ...getRoadPositionCoordinates(startPosition, firstRowHorizontal + imageWidth * (tile.position - 16), fifthRowVertical),
                        ...getRoadPositionCoordinates(endPosition, firstRowHorizontal + imageWidth * (tile.position - 16), fifthRowVertical),
                        road.color
                    ]);
                }
            });
    
            /*
             * Draw Settlements & Cities
             */
            gameState.towns.forEach(function(town) {
                var tile;
                var position;
    
                gameState.board.find(function(gameTile) {
                    for (var i = 0; i < gameTile.indexes.length; i++) {
                        if (gameTile.indexes[i][0] === town.position[0] && gameTile.indexes[i][1] === town.position[1]) {
                            tile = gameTile;
                            position = i;
                            // console.log(town.position + ' is ' + position + ' in ' + JSON.stringify(tile));
                            return true;
                        }
                    }
                    return false;
                });
    
                if (tile.position >= 0 && tile.position < 3) {
                    drawStructure.apply(this, [...getStrucutrePositionCoordinates(position, firstRowHorizontal + imageWidth * tile.position, firstRowVertical), town.color]);
                } else if (tile.position >= 3 && tile.position < 7) {
                    drawStructure.apply(this, [...getStrucutrePositionCoordinates(position, secondRowHoritzonal + imageWidth * (tile.position - 3), secondRowVertical), town.color]);
                } else if (tile.position >= 7 && tile.position < 12) {
                    drawStructure.apply(this, [...getStrucutrePositionCoordinates(position, thirdRowHorizontal + imageWidth * (tile.position - 7), thirdRowVertical), town.color]);
                } else if (tile.position >= 12 && tile.position < 16) {
                    drawStructure.apply(this, [...getStrucutrePositionCoordinates(position, secondRowHoritzonal + imageWidth * (tile.position - 12), fourthRowVertical), town.color]);
                } else if (tile.position >= 16 && tile.position < 19) {
                    drawStructure.apply(this, [...getStrucutrePositionCoordinates(position, firstRowHorizontal + imageWidth * (tile.position - 16), fifthRowVertical), town.color]);
                }
            });
        });

        var drawCircle = function(x, y, color) {
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, 2 * Math.PI);
            ctx.fillStyle = "white";
            ctx.fill();
            ctx.lineWidth = 2
            ctx.strokeStyle = color;
            ctx.closePath();
            ctx.stroke();
        };
    
        var drawSettlement = function(x, y, color) {
            ctx.beginPath();
            ctx.moveTo(x - 10, y - 2);
            ctx.fillStyle = color;
            ctx.lineTo(x - 10, y + 8);
            ctx.lineTo(x + 10, y + 8);
            ctx.lineTo(x + 10, y - 2);
            ctx.lineTo(x, y - 12);
            ctx.lineTo(x - 10, y - 2);
            ctx.fill();
            ctx.closePath();
        };
    
        var drawStructure = function(x, y, color, isCity) {
            drawCircle(x, y, color);
    
            if (isCity) {
                drawCity(x, y, color);
            } else {
                drawSettlement(x, y, color);
            }
        };
    
        var drawCity = function(x, y, color) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x - 10, y);
            ctx.lineTo(x - 10, y + 10);
            ctx.lineTo(x + 10, y + 10);
            ctx.lineTo(x + 10, y - 7);
            ctx.lineTo(x + 5, y - 12);
            ctx.lineTo(x, y - 7);
            ctx.lineTo(x, y - 10);
            ctx.lineTo(x, y);
            ctx.lineTo(x - 10, y);
    
            ctx.fill();
            ctx.closePath();
        };
    
        var drawRoad = function(x1, y1, x2, y2, color) {
            ctx.lineWidth = 10
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.closePath();
            ctx.stroke();
        };

        var getStrucutrePositionCoordinates = function(indexPosition, tileX, tileY) {
            // 0 is 12 oclock
            // 1 is 2 oclock
            // 2 is 4 oclock
            // 3 is 6 oclock
            // 4 is 8 oclock
            // 5 is 10 oclock
    
            switch (indexPosition) {
                case 0: return [tileX + imageWidth/2, tileY + 5];
                case 1: return [tileX + imageWidth, tileY + 42];
                case 2: return [tileX + imageWidth, tileY + imageHeight - 42];
                case 3: return [tileX + imageWidth/2, tileY + imageHeight - 5];
                case 4: return [tileX + 5, tileY + imageHeight - 42];
                case 5: return [tileX + 5, tileY + 42];
            }
        };
    
        var getRoadPositionCoordinates = function(indexPosition, tileX, tileY) {
            // 0 is 12 oclock
            // 1 is 2 oclock
            // 2 is 4 oclock
            // 3 is 6 oclock
            // 4 is 8 oclock
            // 5 is 10 oclock
    
            switch (indexPosition) {
                case 0: return [tileX + imageWidth/2, tileY];
                case 1: return [tileX + imageWidth, tileY + 42];
                case 2: return [tileX + imageWidth, tileY + imageHeight - 42];
                case 3: return [tileX + imageWidth/2, tileY + imageHeight];
                case 4: return [tileX, tileY + imageHeight - 42];
                case 5: return [tileX, tileY + 42];
            }
        };
    }
})();
