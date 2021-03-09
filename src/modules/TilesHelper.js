import constants from './common/constants';
import { shuffle, isOdd, isEven } from './common/helper';

class TilesHelper {
  constructor(tilesPerLine) {
    this.setTilesPerLine(tilesPerLine);
  }

  setTilesPerLine(tilesPerLine) {
    this.tilesPerLine = tilesPerLine;
    this.tilesCount = tilesPerLine ** 2;
    this.solvedTilesArr = [...Array(this.tilesCount).keys()];
    this.solvedTilesArr.push(this.solvedTilesArr.shift());
  }

  getColumn(tileNumber) {
    return tileNumber % this.tilesPerLine;
  }

  getRow(tileNumber) {
    return Math.floor(tileNumber / this.tilesPerLine);
  }

  isAdjacentTile(tileIndex, blankTileIndex) {
    const moveDirection = this.getMoveDirection(tileIndex, blankTileIndex);

    switch (moveDirection) {
      case 'left':
      case 'right':
        return this.getRow(tileIndex) === this.getRow(blankTileIndex);
      case 'top':
      case 'bottom':
        return this.getColumn(tileIndex) === this.getColumn(blankTileIndex);
      default:
        return moveDirection;
    }
  }

  getMoveDirection(tileIndex, blankTileIndex) {
    this.moveDirections = {
      1: 'left',
      [-1]: 'right',
      [this.tilesPerLine]: 'top',
      [-this.tilesPerLine]: 'bottom',
    };

    this.blankTileIndex = +blankTileIndex;
    this.tileIndex = +tileIndex;
    return this.moveDirections[this.tileIndex - this.blankTileIndex];
  }

  getRandomPicture() {
    this.pictureNumber = Math.ceil(Math.random() * constants.PICTURES_COUNT);
    return this.pictureNumber;
  }

  /**
   * Randomizes order of tiles and puts zero-numbered tile at the end
   * to follow the general rules of sliding puzzle
   *
   * @param {Number} tilesCount Overall number of tiles on the board
   * @returns {Array} Returns randomized array with tiles number
   */
  randomizeTiles() {
    const newArr = [];
    for (let i = 1; i < this.tilesCount; i++) {
      newArr.push(i);
    }

    shuffle(newArr);
    newArr.push(0);

    return newArr;
  }

  isSolvable(tilesArr) {
    let inversionsCount = 0;
    for (let i = 0; i < this.tilesCount - 1; i++) {
      for (let j = i + 1; j < this.tilesCount; j++) {
        if (tilesArr[i] && tilesArr[j] && tilesArr[i] > tilesArr[j]) {
          inversionsCount += 1;
        }
      }
    }

    const zeroTileRowFromTheTop = Math.trunc(tilesArr.indexOf(0) / this.tilesPerLine);
    const zeroTileRowFromTheBottom = Math.abs(zeroTileRowFromTheTop - this.tilesPerLine);

    if (isOdd(this.tilesPerLine)) {
      return isEven(inversionsCount);
    }
    return (
      (isOdd(inversionsCount) && isEven(zeroTileRowFromTheBottom))
      || (isEven(inversionsCount) && isOdd(zeroTileRowFromTheBottom))
    );
  }

  generateSolvableArray() {
    let tilesArr = [];

    do {
      tilesArr = this.randomizeTiles();
    } while (!this.isSolvable(tilesArr));

    return tilesArr;
  }

  isSolved(tilesArr) {
    return (
      tilesArr.length === this.solvedTilesArr.length
      && tilesArr.every((tileItem, index) => tileItem === this.solvedTilesArr[index])
    );
  }
}

export default TilesHelper;
