export default class Game {
    static points = {
        '1': 40,
        '2': 100,
        '3': 300,
        '4': 1200
    };

    constructor() {
        this.reset();
    };

    get level() {
        return Math.floor(this.lines / 10);
    };

    getState() {
        const playfield = this.createPlayfield()
        const { x: pieceX, y: pieceY, blocks } = this.activePiece;

        for (let y=0; y<this.playfield.length; y++) {
            playfield[y] = [];

            for (let x=0; x<this.playfield[y].length; x++) {
                playfield[y][x] = this.playfield[y][x];
            }
        };

        for (let y=0; y<blocks.length; y++) {
            for (let x=0; x<blocks[y].length; x++) {
                if(blocks[y][x]) {
                    playfield[pieceY + y][pieceX + x] = blocks[y][x];
                }
            }
        };

        return {
            score: this.score,
            level: this.level,
            lines: this.lines,
            nextPiece: this.nextPiece,
            playfield,
            isGameOver: this.isTopOut
        };
    };

    reset() {
        this.score = 0;
        this.lines = 0;
        this.isTopOut = false;
        this.playfield = this.createPlayfield();
        this.activePiece = this.createPiece();
        this.nextPiece = this.createPiece();

    };

    createPlayfield() {
        const playfield = [];

        for (let y=0; y<20; y++) {
            playfield[y] = [];

            for (let x=0; x<10; x++) {
                playfield[y][x] = 0;
            }
        }

        return playfield;
    };

    createPiece() {
        const index = Math.floor(Math.random() * 7);
        const type = 'IJLOSTZ'[index];
        const piece = {x: 0, y: 0};

        switch(type) {
            case 'I':
                piece.blocks = [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ];
                break;
            case 'J':
                piece.blocks = [
                    [0, 0, 0],
                    [2, 2, 2],
                    [0, 0, 2]
                ];
                break;
            case 'L':
                piece.blocks = [
                    [0, 0, 0],
                    [3, 3, 3],
                    [3, 0, 0]
                ];
                break;
            case 'O':
                piece.blocks = [
                    [0, 0, 0, 0],
                    [0, 4, 4, 0],
                    [0, 4, 4, 0],
                    [0, 0, 0, 0]
                ];
                break;
            case 'S':
                piece.blocks = [
                    [0, 0, 0],
                    [0, 5, 5],
                    [5, 5, 0]
                ];
                break;
            case 'T':
                piece.blocks = [
                    [6, 6, 6],
                    [0, 6, 0],
                    [0, 0, 0]
                ];
                break;
            case 'Z':
                piece.blocks = [
                    [0, 0, 0],
                    [7, 7, 0],
                    [0, 7, 7]
                ];
                break;
            default:
                throw new Error('Неизвестный тип фигуры');
        }
        piece.x = Math.floor((this.playfield[0].length - piece.blocks[0].length) / 2);

        return piece;
    };

    movePieceLeft() {
        this.activePiece.x -= 1;
        if(this.isCollision()) {
            this.activePiece.x += 1;
        }
    };

    movePieceRight() {
        this.activePiece.x += 1;
        if(this.isCollision()) {
            this.activePiece.x -= 1;
        }
    };

    movePieceDown() {
        if(this.isTopOut) {
            return;
        }

        this.activePiece.y += 1;
        if(this.isCollision()) {
            this.activePiece.y -= 1;
            this.lockPiece();
            const clearedLines = this.clearLines();
            this.undateScore(clearedLines);
            this.updatePieces();
        }

        if(this.isCollision()) {
            this.isTopOut = true;
        }
    };

    rotatePiece() {
        const blocks = this.activePiece.blocks;

        const temp = [];
        for (let i=0; i<blocks.length; i++) {
            temp[i] = new Array(blocks.length).fill(0);
        }

        for (let y=0; y<blocks.length; y++) {
            for (let x=0; x<blocks.length; x++) {
                temp[x][y] = blocks[blocks.length - 1 - y][x];
            }
        }
        this.activePiece.blocks = temp;

        if(this.isCollision()) {
            this.activePiece.blocks = blocks;
        }
    }

    isCollision() {
        const { x: pieceX, y: pieceY, blocks } = this.activePiece;

        for(let y=0; y<blocks.length; y++) {
            for(let x=0; x<blocks[y].length; x++) {
                if(blocks[y][x] &&
                    ((this.playfield[pieceY + y] === undefined || this.playfield[pieceY + y][pieceX + x] === undefined)
                    || this.playfield[pieceY + y][pieceX + x])) {
                    return true;
                }
            }
        }

        return false;
    };

    lockPiece() {
        const { y: pieceY, x: pieceX, blocks } = this.activePiece;

        for(let y=0; y<blocks.length; y++) {
            for(let x=0; x<blocks[y].length; x++) {
                if(blocks[y][x]) {
                    this.playfield[pieceY + y][pieceX + x] = blocks[y][x];
                }
            }
        }
    };

    clearLines() {
        const rows = this.playfield.length;
        const columns = this.playfield[0].length;
        const lines = [];

        for (let y=rows-1; y>=0; y--) {
            let numberOfBlocks = 0;

            for (let x=0; x<columns; x++) {
                if(this.playfield[y][x]) {
                    numberOfBlocks += 1;
                }
            }

            if(numberOfBlocks === 0) {
                break;
            } else if(numberOfBlocks < columns) {
                continue;
            } else {
                lines.unshift(y);
            }
        }

        for (let i of lines) {
            this.playfield.splice(i, 1);
            this.playfield.unshift(new Array(columns).fill(0));
        }

        return lines.length;
    };

    undateScore(clearedLines) {
        if(clearedLines > 0) {
            this.score += Game.points[clearedLines] * (this.level + 1);
            this.lines += clearedLines;
        }
    };

    updatePieces() {
        this.activePiece = this.nextPiece;
        this.nextPiece = this.createPiece();
    };

}