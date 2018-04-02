(function() {
    var gameId = window.location.href.split('/').pop();
    var socket = io({
        query: { gameId: gameId }
    });
    // TODO draw the game..
})();
