import constants from './common/constants';
import { formatTime } from './common/helper';

class Counter {
  constructor() {
    this.time = 0;
    this.moves = 0;
  }

  reset() {
    this.stopTimer();
    this.moves = 0;
    this.updateMovesProgress();
  }

  getTime() {
    return this.time;
  }

  setTime(time) {
    this.time = time;
  }

  getFormattedTime() {
    return formatTime(this.time);
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.time += 1;
      this.updateTimeProgress();
    }, constants.ONE_SECOND);
  }

  stopTimer() {
    this.time = 0;
    clearInterval(this.timer);
  }

  pauseTimer() {
    clearInterval(this.timer);
  }

  getMoves() {
    return this.moves;
  }

  setMoves(moves) {
    this.moves = moves;
  }

  incrementMovesCount() {
    this.moves += 1;
  }

  updateTimeProgress(timeEl) {
    if (timeEl) {
      this.timeEl = timeEl;
    }
    this.timeEl.innerText = this.getFormattedTime();
  }

  updateMovesProgress(movesEl) {
    if (movesEl) {
      this.movesEl = movesEl;
    }
    this.movesEl.innerText = this.getMoves();
  }
}

const counter = new Counter();

export default counter;
