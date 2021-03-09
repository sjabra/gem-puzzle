import PuzzleEngine from './modules/PuzzleEngine';
import constants from './modules/common/constants';

import './style.scss';

import './assets/images/logo_icon.ico';

class SlidingPuzzleGame {
  constructor(tilesPerLine) {
    this.tilesPerLine = tilesPerLine;
  }

  init() {
    this.puzzleLayout = new PuzzleEngine(this.tilesPerLine);
    this.puzzleLayout.init();
  }
}

const slidingPuzzle = new SlidingPuzzleGame(constants.DEFAULT_TILES_COUNT);
slidingPuzzle.init();
