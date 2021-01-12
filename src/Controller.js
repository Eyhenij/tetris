export default class Controller {
    constructor(game, view) {
        this.game = game;
        this.view = view;
        this.intervalId = null;
        this.isPlaing = false;

        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));

        view.renderStartScreen();
    }

    update() {
        this.game.movePieceDown();
        this.updateView();
    };

    pause() {
        this.isPlaing = false;
        this.stopTimer();
        this.updateView();
    };

    play() {
        this.isPlaing = true;
        this.startTimer();
        this.updateView();
    };

    reset() {
        this.game.reset();
        this.play();
    };

    updateView() {
        if (this.game.getState().isGameOver) {
            this.view.renderGameOverScreen(this.game.getState());
        } else if (!this.isPlaing) {
            this.view.renderPauseScreen();
        } else {
            this.view.renderMainScreen(this.game.getState());
        }
    };

    startTimer() {
        const speed = 1000 - this.game.getState().level * 100;

        if (!this.intervalId) {
            this.intervalId = setInterval(() => {
                this.update();
            }, speed > 0 ? speed : 100);
        }
    };

    stopTimer() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    };

    handleKeyDown(event) {
        const state = this.game.getState();

        switch (event.keyCode) {
            case 13: // enter-key
                if(state.isGameOver) {
                    this.reset();
                } else if (this.isPlaing) {
                    this.pause();
                } else {
                    this.play();
                }
                break;
            case 37: //left-arrow-key
                this.game.movePieceLeft();
                this.updateView();
                break;
            case 38: //up-arrow-key
                this.game.rotatePiece();
                this.updateView();
                break;
            case 39: //right-arrow-key
                this.game.movePieceRight();
                this.updateView();
                break;
            case 40: //down-arrow-key
                this.stopTimer();
                this.game.movePieceDown();
                this.updateView();
                break;
        }
    };

    handleKeyUp(event) {
        switch (event.keyCode) {
            case 40: // down-arrow-key
                this.startTimer();
                break;
        }
    };
}