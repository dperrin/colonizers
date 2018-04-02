(function() {
    var gameId = window.location.href.split('/').pop();
    var socket = io({
        query: { gameId: gameId }
    });

    var imageWidth = 138;
    var imageHeight = 160;

    var hillsImage = new Image();
    hillsImage.src = "resources/hex-hills.png";

    var forestImage = new Image();
    forestImage.src = "resources/hex-forest.png";

    var mountainsImage = new Image();
    mountainsImage.src = "resources/hex-mountains.png";

    var fieldsImage = new Image();
    fieldsImage.src = "resources/hex-fields.png";

    var pastureImage = new Image();
    pastureImage.src = "resources/hex-pasture.png";

    var desertImage = new Image();
    desertImage.src = "resources/hex-desert.png";

    var canvas = document.getElementById("game");
    var ctx = canvas.getContext("2d");
    canvas.width  = imageWidth * 5;
    canvas.height = (imageHeight - 42) * 5 + 42;
    ctx.font = "24px Comic Sans MS";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";

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

    socket.on('game_state', function(gameState) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        console.log(gameState);

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
         * Draw Settlements & Cities
         */
        // TODO
    });
})();
