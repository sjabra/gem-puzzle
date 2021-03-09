class PuzzleSolver {
  constructor(tilesArr, tilesHelper) {
    this.tilesHelper = tilesHelper;
    this.tilesPerLine = tilesHelper.tilesPerLine;

    this.curSize = this.tilesPerLine;
    this.originalArr = tilesArr;

    this.arrToSolve = [...this.originalArr];
    this.solvedArr = [];
    this.positions = {
      RIGHT: 'right',
      LEFT: 'left',
      TOP: 'top',
      BOTTOM: 'bottom',
    };

    this.lastColumn = this.tilesPerLine - 1;
    this.lastRow = this.lastColumn;
  }

  init() {
    this.fixed = new Array(this.arrToSolve.length);
    this.fixed.fill(false);
  }

  solve() {
    this.init();
    this.solvePuzzle(this.tilesPerLine);
    return this.solvedArr;
  }

  solvePuzzle(size) {
    this.curSize = size;
    if (size < 2) return;

    const curLine = this.tilesPerLine - this.curSize;
    if (size > 2) {
      this.solveRow(curLine);
      this.solveColumn(curLine);
      this.solvePuzzle(size - 1);
    } else {
      this.solveRow(curLine);
    }
  }

  solveRow(curRow) {
    for (let i = curRow; i < this.tilesPerLine - 2; i++) {
      const tileToMove = curRow * this.tilesPerLine + (i + 1);
      this.moveTile(tileToMove, i, curRow);
      this.fixed[tileToMove - 1] = true;
    }

    const secondToLastTile = (curRow + 1) * this.tilesPerLine - 1;
    const lastTile = secondToLastTile + 1;

    if (
      this.areInTheSameRow(secondToLastTile, lastTile)
      && this.getTileColumn(secondToLastTile) === this.lastColumn - 1
      && this.getTileColumn(secondToLastTile) === this.lastColumn
    ) {
      return;
    }

    this.moveTile(secondToLastTile, this.lastColumn, curRow);
    this.moveTile(lastTile, this.lastColumn, curRow + 1);

    if (!this.areInTheSameColumn(secondToLastTile, lastTile)) {
      this.moveTile(lastTile, this.lastColumn, curRow + 2);
      this.moveTile(secondToLastTile, this.lastColumn, curRow);
      this.moveTileDown();
      this.moveTileRight();
      this.moveTileDown();
    }

    this.rotateLastTwoInARow(lastTile);
    this.fixed[secondToLastTile - 1] = true;
    this.fixed[lastTile - 1] = true;
  }

  solveColumn(curColumn) {
    for (let i = curColumn; i < this.tilesPerLine - 2; i++) {
      const tileToMove = i * this.tilesPerLine + curColumn + 1;
      this.moveTile(tileToMove, curColumn, i);
      this.fixed[tileToMove - 1] = true;
    }

    const secondToLastTile = (this.lastRow - 1) * this.tilesPerLine + curColumn + 1;
    const lastTile = secondToLastTile + this.tilesPerLine;

    if (
      this.areInTheSameColumn(secondToLastTile, lastTile)
      && this.getTileRow(secondToLastTile) === this.lastRow - 1
      && this.getTileRow(secondToLastTile) === this.lastRow
    ) {
      return;
    }

    this.moveTile(secondToLastTile, curColumn, this.lastRow);
    this.moveTile(lastTile, curColumn + 1, this.lastRow);

    if (!this.areInTheSameRow(secondToLastTile, lastTile)) {
      this.moveTile(lastTile, curColumn + 2, this.lastRow);
      this.moveTile(secondToLastTile, curColumn, this.lastRow);
      this.moveTile(lastTile, curColumn + 1, this.lastRow);
    }

    this.rotateLastTwoInAColumn(lastTile);
    this.fixed[secondToLastTile - 1] = true;
    this.fixed[lastTile - 1] = true;
  }

  moveTile(tile, column, row) {
    if (this.isInCorrectPosition(tile, column, row)) return;

    this.moveBlankTileTo(tile);

    while (!this.isInCorrectPosition(tile, column, row)) {
      const destHorizontalDiff = this.getTileColumn(tile) - column;
      const destVerticalDiff = this.getTileRow(tile) - row;

      if (destHorizontalDiff > 0) {
        this.moveTileHorizontalLeft(tile);
      } else if (destHorizontalDiff < 0) {
        this.moveTileHorizontalRight(tile);
      }

      if (destVerticalDiff > 0) {
        this.moveTileVerticalUp(tile);
      } else if (destVerticalDiff < 0) {
        this.moveTileVerticalDown(tile);
      }
    }
  }

  getTileColDiff(firstTile, secondTile) {
    return this.getTileColumn(firstTile) - this.getTileColumn(secondTile);
  }

  getTileRowDiff(firstTile, secondTile) {
    return this.getTileRow(firstTile) - this.getTileRow(secondTile);
  }

  getTilePositionRelativeTo(fromTile, toTile) {
    if (this.getTileColDiff(fromTile, toTile) < 0) {
      return this.positions.RIGHT;
    }

    if (this.getTileColDiff(fromTile, toTile) > 0) {
      return this.positions.LEFT;
    }

    if (this.getTileRowDiff(fromTile, toTile) < 0) {
      return this.positions.BOTTOM;
    }

    if (this.getTileRowDiff(fromTile, toTile) > 0) {
      return this.positions.TOP;
    }

    return this;
  }

  getBlankTilePosition(tile) {
    return this.getTilePositionRelativeTo(tile, 0);
  }

  isTopLeftMoveRestricted() {
    return (
      this.fixed[this.getBlankTileIndex() - 1]
      || this.fixed[this.getBlankTileIndex() - this.tilesPerLine - 1]
    );
  }

  isTopLeftRotateMoveRestricted() {
    return (
      this.isTopLeftMoveRestricted()
      || this.fixed[this.getBlankTileIndex() - 2]
      || this.fixed[this.getBlankTileIndex() - this.tilesPerLine - 2]
    );
  }

  isLeftDownMoveRestricted() {
    return (
      this.fixed[this.getBlankTileIndex() - 1]
      || this.fixed[this.getBlankTileIndex() + this.tilesPerLine - 1]
    );
  }

  isTopOrTopRightMoveRestricted() {
    return (
      this.fixed[this.getBlankTileIndex() - this.tilesPerLine + 1]
      || this.fixed[this.getBlankTileIndex() - this.tilesPerLine]
    );
  }

  isTopAndTopRightMoveRestricted() {
    return (
      this.fixed[this.getBlankTileIndex() - this.tilesPerLine + 1]
      && this.fixed[this.getBlankTileIndex() - this.tilesPerLine]
    );
  }

  moveTileHorizontalLeft(tile) {
    switch (this.getBlankTilePosition(tile)) {
      case this.positions.RIGHT:
        this.rotateTileHorizontalLeft();
        break;
      case this.positions.TOP:
        if (this.isLeftDownMoveRestricted()) {
          this.moveTileRight();
          this.moveTileDown();
          this.rotateTileHorizontalLeft();
        } else {
          this.moveTileLeft();
          this.moveTileDown();
        }
        break;
      case this.positions.BOTTOM:
        if (this.isTopLeftMoveRestricted()) {
          this.moveTileUp();
          this.rotateTileVerticalDown();
          this.moveTileLeft();
          this.moveTileUp();
        } else {
          this.moveTileLeft();
          this.moveTileUp();
        }
        break;
      default:
        break;
    }
    this.moveTileRight();
  }

  rotateTileHorizontalLeft() {
    if (this.getTileRow(0) === 0 || this.isTopLeftRotateMoveRestricted()) {
      this.moveTileDown();
      this.moveTileLeft();
      this.moveTileLeft();
      this.moveTileUp();
    } else {
      this.moveTileUp();
      this.moveTileLeft();
      this.moveTileLeft();
      this.moveTileDown();
    }
  }

  moveTileHorizontalRight(tile) {
    switch (this.getBlankTilePosition(tile)) {
      case this.positions.LEFT:
        this.rotateTileHorizontalRight();
        break;
      case this.positions.TOP:
        this.moveTileRight();
        this.moveTileDown();
        break;
      case this.positions.BOTTOM:
        this.moveTileRight();
        this.moveTileUp();
        break;
      default:
        break;
    }
    this.moveTileLeft();
  }

  rotateTileHorizontalRight() {
    if (this.getTileRow(0) === 0 || this.isTopOrTopRightMoveRestricted()) {
      this.moveTileDown();
      this.moveTileRight();
      this.moveTileRight();
      this.moveTileUp();
    } else {
      this.moveTileUp();
      this.moveTileRight();
      this.moveTileRight();
      this.moveTileDown();
    }
  }

  moveTileVerticalUp(tile) {
    switch (this.getBlankTilePosition(tile)) {
      case this.positions.RIGHT:
        this.moveTileUp();
        this.moveTileLeft();
        break;
      case this.positions.BOTTOM:
        this.rotateTileVerticalTop();
        break;
      case this.positions.LEFT:
        if (this.isTopAndTopRightMoveRestricted()) {
          return;
        }

        if (this.isTopOrTopRightMoveRestricted()) {
          this.moveTileDown();
          this.moveTileRight();
          this.rotateTileVerticalTop();
        } else {
          this.moveTileUp();
          this.moveTileRight();
        }
        break;
      default:
        break;
    }
    this.moveTileDown();
  }

  rotateTileVerticalTop() {
    if (this.getTileColumn(0) === this.lastColumn) {
      this.moveTileLeft();
      this.moveTileUp();
      this.moveTileUp();
      this.moveTileRight();
    } else {
      this.moveTileRight();
      this.moveTileUp();
      this.moveTileUp();
      this.moveTileLeft();
    }
  }

  moveTileVerticalDown(tile) {
    switch (this.getBlankTilePosition(tile)) {
      case this.positions.RIGHT:
        this.moveTileDown();
        this.moveTileLeft();
        break;
      case this.positions.TOP:
        this.rotateTileVerticalDown();
        break;
      case this.positions.LEFT:
        this.moveTileDown();
        this.moveTileRight();
        break;
      default:
        break;
    }
    this.moveTileUp();
  }

  rotateTileVerticalDown() {
    if (this.getTileColumn(0) === this.lastColumn) {
      this.moveTileLeft();
      this.moveTileDown();
      this.moveTileDown();
      this.moveTileRight();
    } else {
      this.moveTileRight();
      this.moveTileDown();
      this.moveTileDown();
      this.moveTileLeft();
    }
  }

  rotateLastTwoInARow(lastTile) {
    if (this.isAdjacentTile(lastTile, 0)) {
      switch (this.getBlankTilePosition(lastTile)) {
        case this.positions.LEFT:
          this.moveTileUp();
          this.moveTileRight();
          this.moveTileDown();
          break;

        case this.positions.BOTTOM:
          this.moveTileLeft();
          this.moveTileUp();
          this.moveTileUp();
          this.moveTileRight();
          this.moveTileDown();
          break;
        case this.positions.TOP:
          this.moveTileDown();
          break;
        default:
          break;
      }
    } else {
      this.moveBlankTileTo(lastTile);
      this.rotateLastTwoInARow(lastTile);
    }
  }

  rotateLastTwoInAColumn(lastTile) {
    if (this.isAdjacentTile(lastTile, 0)) {
      switch (this.getBlankTilePosition(lastTile)) {
        case this.positions.LEFT:
          this.moveTileLeft();
          this.moveTileDown();
          this.moveTileRight();
          break;
        case this.positions.TOP:
          this.moveTileLeft();
          this.moveTileDown();
          this.moveTileRight();
          break;
        case this.positions.RIGHT:
          this.moveTileUp();
          this.moveTileLeft();
          this.moveTileLeft();
          this.moveTileDown();
          this.moveTileRight();
          break;
        default:
          break;
      }
    } else {
      this.moveBlankTileTo(lastTile);
      this.rotateLastTwoInAColumn(lastTile);
    }
  }

  moveBlankTileTo(tile) {
    if (this.isAdjacentTile(tile, 0)) return;

    while (!this.isAdjacentTile(tile, 0)) {
      const rowsDiff = this.getTileRowDiff(0, tile);
      const columnsDiff = this.getTileColDiff(0, tile);
      const blankTileIndex = this.getBlankTileIndex();

      if (columnsDiff > 0 && !this.fixed[blankTileIndex - 1]) {
        this.moveTileLeft();
      } else if (columnsDiff < 0 && !this.fixed[blankTileIndex + 1]) {
        this.moveTileRight();
      } else if (rowsDiff > 0 && !this.fixed[blankTileIndex - this.tilesPerLine]) {
        this.moveTileUp();
      } else if (rowsDiff < 0 && !this.fixed[blankTileIndex + this.tilesPerLine]) {
        this.moveTileDown();
      }
    }
  }

  moveTileLeft() {
    const blankTileIndex = this.getBlankTileIndex();
    const tileToClickIndex = blankTileIndex - 1;

    this.swapTiles(tileToClickIndex, blankTileIndex);
  }

  moveTileRight() {
    const blankTileIndex = this.getBlankTileIndex();
    const tileToClickIndex = blankTileIndex + 1;

    this.swapTiles(tileToClickIndex, blankTileIndex);
  }

  moveTileUp() {
    const blankTileIndex = this.getBlankTileIndex();
    const tileToClickIndex = blankTileIndex - this.tilesPerLine;

    this.swapTiles(tileToClickIndex, blankTileIndex);
  }

  moveTileDown() {
    const blankTileIndex = this.getBlankTileIndex();
    const tileToClickIndex = blankTileIndex + this.tilesPerLine;

    this.swapTiles(tileToClickIndex, blankTileIndex);
  }

  swapTiles(i, j) {
    this.solvedArr.push(i);
    [this.arrToSolve[i], this.arrToSolve[j]] = [this.arrToSolve[j], this.arrToSolve[i]];
  }

  getBlankTileIndex() {
    return this.getTileIndex(0);
  }

  getTileIndex(tile) {
    return this.arrToSolve.indexOf(tile);
  }

  getTileRow(tile) {
    const tileIndex = this.getTileIndex(tile);
    return this.tilesHelper.getRow(tileIndex);
  }

  getTileColumn(tile) {
    const tileIndex = this.getTileIndex(tile);
    return this.tilesHelper.getColumn(tileIndex);
  }

  areInTheSameRow(firstTile, secondTile) {
    return this.getTileRow(firstTile) === this.getTileRow(secondTile);
  }

  areInTheSameColumn(firstTile, secondTile) {
    return this.getTileColumn(firstTile) === this.getTileColumn(secondTile);
  }

  isAdjacentTile(firstTile, secondTile) {
    return this.tilesHelper.isAdjacentTile(
      this.getTileIndex(firstTile),
      this.getTileIndex(secondTile),
    );
  }

  isInCorrectPosition(tile, column, row) {
    return this.getTileRow(tile) === row && this.getTileColumn(tile) === column;
  }
}

export default PuzzleSolver;
