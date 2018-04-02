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

        var getHexAttribute = function(position, attribute) {
            return gameState.board.find(function(element) {
                return element.position === position;
            })[attribute];
        }

        var firstRowHorizontal = canvas.width/2 - imageWidth/2 - imageWidth;
        var firstRowVertical = 0;
        ctx.drawImage(getImage(getHexAttribute(0, 'resource')), firstRowHorizontal, firstRowVertical);
        ctx.drawImage(getImage(getHexAttribute(1, 'resource')), firstRowHorizontal + imageWidth, firstRowVertical);
        ctx.drawImage(getImage(getHexAttribute(2, 'resource')), firstRowHorizontal + imageWidth * 2, firstRowVertical);

        var secondRowHoritzonal = canvas.width/2 - imageWidth * 2;
        var secondRowVertical = imageHeight - 42;
        ctx.drawImage(getImage(getHexAttribute(3, 'resource')), secondRowHoritzonal, secondRowVertical);
        ctx.drawImage(getImage(getHexAttribute(4, 'resource')), secondRowHoritzonal + imageWidth, secondRowVertical);
        ctx.drawImage(getImage(getHexAttribute(5, 'resource')), secondRowHoritzonal + imageWidth * 2, secondRowVertical);
        ctx.drawImage(getImage(getHexAttribute(6, 'resource')), secondRowHoritzonal + imageWidth * 3, secondRowVertical);

        var thirdRowHorizontal = canvas.width/2 - imageWidth/2 - imageWidth * 2;
        var thirdRowVertical = (imageHeight - 42) * 2;
        ctx.drawImage(getImage(getHexAttribute(7, 'resource')), thirdRowHorizontal, thirdRowVertical);
        ctx.drawImage(getImage(getHexAttribute(8, 'resource')), thirdRowHorizontal + imageWidth, thirdRowVertical);
        ctx.drawImage(getImage(getHexAttribute(9, 'resource')), thirdRowHorizontal + imageWidth * 2, thirdRowVertical);
        ctx.drawImage(getImage(getHexAttribute(10, 'resource')), thirdRowHorizontal + imageWidth * 3, thirdRowVertical);
        ctx.drawImage(getImage(getHexAttribute(11, 'resource')), thirdRowHorizontal + imageWidth * 4, thirdRowVertical);

        var fourthRowVertical = (imageHeight - 42) * 3;
        ctx.drawImage(getImage(getHexAttribute(12, 'resource')), secondRowHoritzonal, fourthRowVertical);
        ctx.drawImage(getImage(getHexAttribute(13, 'resource')), secondRowHoritzonal + imageWidth, fourthRowVertical);
        ctx.drawImage(getImage(getHexAttribute(14, 'resource')), secondRowHoritzonal + imageWidth * 2, fourthRowVertical);
        ctx.drawImage(getImage(getHexAttribute(15, 'resource')), secondRowHoritzonal + imageWidth * 3, fourthRowVertical);

        var fifthRowVertical = (imageHeight - 42) * 4;
        ctx.drawImage(getImage(getHexAttribute(16, 'resource')), firstRowHorizontal, fifthRowVertical);
        ctx.drawImage(getImage(getHexAttribute(17, 'resource')), firstRowHorizontal + imageWidth, fifthRowVertical);
        ctx.drawImage(getImage(getHexAttribute(18, 'resource')), firstRowHorizontal + imageWidth * 2, fifthRowVertical);
    });
})();
