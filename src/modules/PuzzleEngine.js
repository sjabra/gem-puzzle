import constants from './common/constants';
import {
  createElement, timestampToDate, formatTime,
} from './common/helper';

import counter from './Counter';
import TilesHelper from './TilesHelper';
import PuzzleSolver from './PuzzleSolver';

import tileMoveSound from '../assets/tile_move_sound.wav';

class PuzzleEngine {
  constructor(tilesPerLine) {
    this.tilesPerLine = tilesPerLine;
    this.tilesHelper = new TilesHelper(this.tilesPerLine);

    this.tilesArr = this.tilesHelper.generateSolvableArray();
    this.gameTypeElement = null;
    this.gameType = constants.PUZZLE_TYPE.NUMBERS;
    this.pictureNumber = null;
    this.puzzleTiles = [];

    this.winModal = null;

    this.savedGames = JSON.parse(localStorage.getItem(constants.SAVES_STORAGE_NAME)) || [];
    this.bestResults = JSON.parse(localStorage.getItem(constants.BEST_RESULTS_STORAGE_NAME)) || [];

    this.isAutoSolveInProgress = false;
    this.isSoundTurnedOn = true;
    this.isGameOnPause = false;
    this.isNewGame = true;

    this.buttons = [
      { name: 'New Game', event: this.openNewGameMenu },
      { name: 'Save', event: this.saveGame },
      { name: 'Load', event: this.openLoadGameMenu },
      { name: 'Best', event: this.showLeaderboard },
      { name: 'Give up', event: this.solvePuzzle },
    ];
  }

  reset(tilesPerLine) {
    this.puzzleTiles = [];
    this.tilesPerLine = tilesPerLine;
    this.tilesHelper.setTilesPerLine(this.tilesPerLine);
    this.tilesArr = this.tilesHelper.generateSolvableArray();
    this.removeTiles();
    this.setGridSize();
    counter.reset();
  }

  init() {
    this.createLayout();
    counter.startTimer();
    this.startMovesRegister();
  }

  createLayout() {
    const disableControlsBg = createElement('div', 'disable-controls-bg');
    const puzzleWrapper = createElement('div', constants.PUZZLE_WRAPPER_CLASS);

    this.puzzleWrapper = puzzleWrapper;
    this.puzzle = createElement('div', constants.PUZZLE_CLASS);

    this.disableControlsBg = disableControlsBg;

    this.initProgressInfo();
    this.initTiles();
    this.initButtons();
    this.initAudio();

    document.body.appendChild(disableControlsBg);
    document.body.appendChild(puzzleWrapper);
  }

  initProgressInfo() {
    const progressWrapper = createElement('div', `${constants.PUZZLE_CLASS}__progress-wrapper`);

    const timeWrapper = createElement('div', `${constants.PUZZLE_CLASS}__time`);
    const timeLabel = createElement('span');
    timeLabel.innerText = 'Time: ';
    const timeEl = createElement('span');
    timeWrapper.appendChild(timeLabel);
    timeWrapper.appendChild(timeEl);
    counter.updateTimeProgress(timeEl);

    const movesWrapper = createElement('div', `${constants.PUZZLE_CLASS}__moves`);
    const movesLabel = createElement('span');
    movesLabel.innerText = 'Moves: ';
    const movesEl = createElement('span');
    movesWrapper.appendChild(movesLabel);
    movesWrapper.appendChild(movesEl);
    counter.updateMovesProgress(movesEl);

    const soundSwitcherEl = createElement('div', `${constants.PUZZLE_CLASS}__sound-switcher`);
    const soundIcon = createElement('i', 'material-icons');
    soundIcon.innerText = 'volume_up';
    soundSwitcherEl.addEventListener('click', () => {
      this.isSoundTurnedOn = !this.isSoundTurnedOn;
      soundIcon.innerText = this.isSoundTurnedOn ? 'volume_up' : 'volume_off';
    });
    soundSwitcherEl.innerText = 'Sound: ';
    soundSwitcherEl.appendChild(soundIcon);

    progressWrapper.appendChild(timeWrapper);
    progressWrapper.appendChild(movesWrapper);
    progressWrapper.appendChild(soundSwitcherEl);
    this.puzzleWrapper.appendChild(progressWrapper);
  }

  initTiles() {
    this.setGridSize();
    this.drawTiles();
    this.puzzleWrapper.appendChild(this.puzzle);
  }

  initAudio() {
    this.tileAudio = new Audio(tileMoveSound);
    document.body.append(this.tileAudio);
  }

  setGridSize() {
    this.puzzleWrapper.style.setProperty(constants.CSS_TILES_COUNT_PROP, this.tilesPerLine);
  }

  drawTiles() {
    this.pictureNumber = this.isNewGame ? this.tilesHelper.getRandomPicture() : this.pictureNumber;

    this.tilesArr.forEach((tileN, tileIndex) => {
      const puzzleTile = document.createElement('div');
      puzzleTile.style.setProperty('order', tileIndex);
      puzzleTile.setAttribute('index', tileIndex);

      if (tileN > 0) {
        puzzleTile.classList.add(`${constants.PUZZLE_CLASS}__tile`);

        if (this.gameType === constants.PUZZLE_TYPE.PICTURES) {
          this.drawPictureTile(puzzleTile, this.pictureNumber, tileN);
        } else {
          this.drawNumberTile(puzzleTile, tileN);
        }
      } else {
        this.blankTile = puzzleTile;
      }
      this.puzzleTiles.push(puzzleTile);
      this.puzzle.appendChild(puzzleTile);
    });
  }

  drawNumberTile(tile, tileNumber) {
    const tileImg = createElement('img', `${constants.PUZZLE_CLASS}__img`);
    tileImg.src = `./assets/images/tiles/numbers/tile_${tileNumber}-min.png`;
    tileImg.alt = `Puzzle tile ${tileNumber}`;
    tile.appendChild(tileImg);

    if (this.tilesPerLine <= 4) {
      tileImg.style.setProperty('width', '100%');
    }
  }

  drawPictureTile(tile, pictureNumber, tileN) {
    const tileImg = createElement('div', `${constants.PUZZLE_CLASS}__picture`);
    tileImg.style.backgroundImage = `url(./assets/images/tiles/pictures/${pictureNumber}.jpg)`;
    const percent = 100 / this.tilesPerLine;
    tileImg.style.backgroundPosition = `${this.tilesHelper.getColumn(tileN - 1) * percent}% `
      + `${this.tilesHelper.getRow(tileN - 1) * percent}%`;
    tile.appendChild(tileImg);
  }

  initButtons() {
    const buttonsWrapper = createElement('div', `${constants.PUZZLE_CLASS}__buttons-wrapper`);

    for (let i = 0; i < this.buttons.length; i++) {
      const button = createElement('div', `${constants.PUZZLE_CLASS}__button`);
      button.innerText = this.buttons[i].name;
      button.addEventListener('click', () => {
        const buttonEvent = this.buttons[i].event.bind(this);
        buttonEvent();
      });
      buttonsWrapper.appendChild(button);
    }

    this.puzzleWrapper.appendChild(buttonsWrapper);
  }

  pauseGame() {
    this.isGameOnPause = true;
    this.disableControlsBg.style.display = 'block';
  }

  unpauseGame() {
    this.isGameOnPause = false;
    this.disableControlsBg.style.display = 'none';
  }

  createMenuOptionsElement(listTag, listName, elClass, optionsArr, optionEvent) {
    const list = createElement(listTag, elClass);
    list.classList.add(`${elClass}-${listName}`);

    optionsArr.forEach((option) => {
      const listItem = createElement('li', `${elClass}-item`);
      listItem.classList.add(`${elClass}-item-${listName}`);

      if (option.dataAttr === undefined) {
        listItem.classList.add(`${elClass}-item-${listName}-back`);
      }

      if (option.isHoverAllowed) {
        listItem.classList.add(`${elClass}-item-hover-allow`);
      }

      list.appendChild(listItem);

      listItem.addEventListener('click', () => {
        this.unpauseGame();
        if (option.dataAttr !== undefined) {
          if (optionEvent) {
            optionEvent(option.dataAttr);
          }
        } else {
          this.puzzle.removeChild(this.puzzle.lastChild);
          counter.startTimer();
        }
      });
      listItem.innerText = option.value;
    });
    return list;
  }

  openNewGameMenu() {
    if (!this.isGameOnPause && !this.isAutoSolveInProgress) {
      this.isNewGame = true;
      this.pauseGame();
      this.hideWinMenu();

      if (this.gameTypeElement) {
        this.gameTypeElement.classList.remove('active');
      }

      counter.pauseTimer();
      const newGameMenu = createElement('div', `${constants.PUZZLE_CLASS}__menu`);
      const newGameWrapper = createElement('div', `${constants.PUZZLE_CLASS}__new-game-wrapper`);
      const puzzleDimensions = constants.PUZZLE_SIZES.map((size) => {
        const puzzleDimension = {
          dataAttr: size,
          value: `${size}x${size}`,
          isHoverAllowed: true,
        };
        return puzzleDimension;
      });
      puzzleDimensions.push({ value: 'Back', isHoverAllowed: true });

      const gameTypeWrapper = createElement('div', `${constants.PUZZLE_CLASS}__game-types`);
      const gameTypeNumbers = createElement('span', `${constants.PUZZLE_CLASS}__game-type`);
      gameTypeNumbers.innerText = constants.PUZZLE_TYPE.NUMBERS;

      const gameTypePictures = createElement('span', `${constants.PUZZLE_CLASS}__game-type`);
      gameTypePictures.innerText = constants.PUZZLE_TYPE.PICTURES;

      gameTypeWrapper.appendChild(gameTypeNumbers);
      gameTypeWrapper.appendChild(gameTypePictures);

      gameTypeNumbers.addEventListener('click', () => {
        if (this.gameTypeElement) {
          this.gameTypeElement.classList.remove('active');
        }
        this.gameType = constants.PUZZLE_TYPE.NUMBERS;
        this.gameTypeElement = gameTypeNumbers;
        this.gameTypeElement.classList.add('active');
      });

      gameTypePictures.addEventListener('click', () => {
        if (this.gameTypeElement) {
          this.gameTypeElement.classList.remove('active');
        }
        this.gameType = constants.PUZZLE_TYPE.PICTURES;
        this.gameTypeElement = gameTypePictures;
        this.gameTypeElement.classList.add('active');
      });

      const gameDimensionsList = this.createMenuOptionsElement(
        'li',
        'new-game',
        `${constants.PUZZLE_CLASS}__list`,
        puzzleDimensions,
        this.updatePuzzle.bind(this),
      );

      newGameWrapper.appendChild(gameTypeWrapper);
      newGameWrapper.appendChild(gameDimensionsList);
      newGameMenu.appendChild(newGameWrapper);
      this.puzzle.appendChild(newGameMenu);
    }
  }

  openWinMenu(isAutoSolved) {
    this.pauseGame();
    counter.pauseTimer();
    const winModal = createElement('div', `${constants.PUZZLE_CLASS}__menu`);
    const winWrapper = createElement('div', `${constants.PUZZLE_CLASS}__win-wrapper`);

    const winHeader = createElement('span', 'win-header');
    const winInfo = createElement('span', 'win-info');
    if (isAutoSolved) {
      winHeader.innerText = 'Game over!';
      winInfo.innerText = `Computer won the game with total time ${counter.getFormattedTime()} in ${counter.getMoves()} move(s) Try to compete in the new game!`;
    } else {
      winHeader.innerText = 'Congratulations!';
      winInfo.innerText = ` You won with total time ${counter.getFormattedTime()} in only ${counter.getMoves()} move(s)`;
    }

    const startNewGameButton = createElement('div', 'win-button');
    startNewGameButton.innerText = 'Start New Game';
    startNewGameButton.addEventListener('click', () => {
      this.unpauseGame();
      this.openNewGameMenu();
    });

    const leaderboardButton = createElement('div', 'win-button');
    leaderboardButton.innerText = 'Show Leaderboard';
    leaderboardButton.addEventListener('click', () => {
      this.unpauseGame();
      this.showLeaderboard();
    });

    winWrapper.appendChild(winHeader);
    winWrapper.appendChild(winInfo);
    winWrapper.appendChild(startNewGameButton);
    winWrapper.appendChild(leaderboardButton);
    winModal.appendChild(winWrapper);

    this.winModal = winModal;
    this.puzzle.appendChild(winModal);
  }

  hideWinMenu() {
    if (this.winModal) {
      this.puzzle.removeChild(this.winModal);
      this.winModal = null;
    }
  }

  saveResult() {
    const resultItem = {
      time: counter.getTime(),
      moves: counter.getMoves(),
      tilesPerLine: this.tilesPerLine,
    };
    this.bestResults.push(resultItem);
    this.bestResults.sort((a, b) => {
      const getWeight = (item) => (item.time * item.moves) / item.tilesPerLine ** 2;
      return getWeight(a) - getWeight(b);
    });

    if (this.bestResults.length > constants.MAX_SAVES_COUNT) {
      this.bestResults.splice(constants.MAX_SAVES_COUNT);
    }

    localStorage.setItem(constants.BEST_RESULTS_STORAGE_NAME, JSON.stringify(this.bestResults));
  }

  saveGame() {
    if (!this.isGameOnPause && !this.isAutoSolveInProgress) {
      this.pauseGame();

      const savedGame = {
        timestamp: Date.now(),
        tilesPerLine: this.tilesPerLine,
        moves: counter.getMoves(),
        time: counter.getTime(),
        type: this.gameType,
        pictureNumber: this.pictureNumber,
        tilesArr: [...this.tilesArr],
      };
      this.savedGames.unshift(savedGame);

      if (this.savedGames.length > constants.MAX_SAVES_COUNT) {
        this.savedGames.splice(constants.MAX_SAVES_COUNT);
      }

      localStorage.setItem(constants.SAVES_STORAGE_NAME, JSON.stringify(this.savedGames));
      this.showGameIsSavedInfoMenu();
    }
  }

  showGameIsSavedInfoMenu() {
    counter.pauseTimer();
    const saveInfoModal = createElement('div', `${constants.PUZZLE_CLASS}__menu`);
    const saveWrapper = createElement('div', `${constants.PUZZLE_CLASS}__save-wrapper`);

    const saveInfoText = createElement('span', 'save-info-heading');
    const saveInfoSubText = createElement('span', 'save-info-subheading');
    saveInfoText.innerText = 'Your game progress is saved!';
    saveInfoSubText.innerText = 'You may now proceed';

    saveWrapper.appendChild(saveInfoText);
    saveWrapper.appendChild(saveInfoSubText);
    saveInfoModal.appendChild(saveWrapper);

    this.puzzle.appendChild(saveInfoModal);

    setTimeout(() => {
      this.puzzle.removeChild(saveInfoModal);
      this.unpauseGame();
      counter.startTimer();
    }, constants.ONE_SECOND);
  }

  openLoadGameMenu() {
    if (!this.isGameOnPause && !this.isAutoSolveInProgress) {
      this.isNewGame = false;
      this.pauseGame();
      this.hideWinMenu();

      counter.pauseTimer();
      const loadGameMenu = createElement('div', `${constants.PUZZLE_CLASS}__menu`);
      const gamesToLoad = this.savedGames.map((savedGame, index) => {
        this.gameToLoad = {
          dataAttr: index,
          value:
            `${savedGame.tilesPerLine}x${savedGame.tilesPerLine}, `
            + `${savedGame.moves} moves (${timestampToDate(savedGame.timestamp)})`,
          isHoverAllowed: true,
        };
        return this.gameToLoad;
      });
      gamesToLoad.push({ value: 'Back', isHoverAllowed: true });

      const gamesToLoadList = this.createMenuOptionsElement(
        'ol',
        'load',
        `${constants.PUZZLE_CLASS}__list`,
        gamesToLoad,
        this.loadGame.bind(this),
      );
      loadGameMenu.appendChild(gamesToLoadList);
      this.puzzle.appendChild(loadGameMenu);
    }
  }

  loadGame(gameToLoadIndex) {
    const gameToLoad = this.savedGames[gameToLoadIndex];
    this.tilesArr = gameToLoad.tilesArr;
    this.tilesPerLine = gameToLoad.tilesPerLine;
    this.tilesHelper.setTilesPerLine(this.tilesPerLine);
    this.gameType = gameToLoad.type;
    this.pictureNumber = gameToLoad.pictureNumber;

    this.removeTiles();
    this.setGridSize();
    this.drawTiles();
    this.startMovesRegister();

    counter.setMoves(gameToLoad.moves);
    counter.updateMovesProgress();
    counter.setTime(gameToLoad.time);
    counter.updateTimeProgress();
    counter.startTimer();

    this.unpauseGame();
  }

  showLeaderboard() {
    if (!this.isGameOnPause && !this.isAutoSolveInProgress) {
      this.pauseGame();
      this.hideWinMenu();

      counter.pauseTimer();
      const leaderboardMenu = createElement('div', `${constants.PUZZLE_CLASS}__menu`);
      const leaderboardItems = this.bestResults.map((leaderboardItem, index) => {
        const leaderboardItemData = {
          dataAttr: index,
          value:
            `${leaderboardItem.tilesPerLine}x${leaderboardItem.tilesPerLine}, `
            + `${leaderboardItem.moves} move(s) solved in ${formatTime(leaderboardItem.time)}`,
          isHoverAllowed: false,
        };
        return leaderboardItemData;
      });
      leaderboardItems.push({ value: 'Back', isHoverAllowed: true });

      const leaderboardList = this.createMenuOptionsElement(
        'ol',
        'leaderboard',
        `${constants.PUZZLE_CLASS}__list`,
        leaderboardItems,
      );
      leaderboardMenu.appendChild(leaderboardList);
      this.puzzle.appendChild(leaderboardMenu);
    }
  }

  solvePuzzle() {
    if (!this.isGameOnPause && !this.isAutoSolveInProgress) {
      this.isAutoSolveInProgress = true;
      this.puzzleSolver = new PuzzleSolver(this.tilesArr, this.tilesHelper);
      this.solvedArr = this.puzzleSolver.solve();

      const click = new Event('autoclick', { bubbles: true });

      let i = 0;
      const solvePuzzle = setInterval(() => {
        const tileToClick = document.querySelector(`[index='${this.solvedArr[i]}']`);
        tileToClick.dispatchEvent(click);
        i += 1;

        if (i === this.solvedArr.length) {
          clearInterval(solvePuzzle);
          this.isAutoSolveInProgress = false;
          this.pauseGame();
          setTimeout(() => this.endGame(true), constants.ONE_SECOND / 2);
        }
      }, 400);
    }
  }

  removeTiles() {
    while (this.puzzle.firstChild) {
      this.puzzle.firstChild.remove();
    }
  }

  updatePuzzle(tilesPerLine) {
    this.reset(tilesPerLine);
    this.drawTiles();
    counter.startTimer();
    this.startMovesRegister();
  }

  startMovesRegister() {
    this.puzzleTiles.forEach((puzzleTile) => {
      let curTile = puzzleTile;

      puzzleTile.addEventListener('autoclick', (event) => {
        if (!event.isTrusted) {
          this.blankTileIndex = this.blankTile.getAttribute(constants.INDEX);
          this.curTileIndex = event.currentTarget.getAttribute(constants.INDEX);

          this.swapTilesOnClick(event.currentTarget, this.blankTile);

          if (this.isSoundTurnedOn) {
            this.tileAudio.play();
          }

          counter.incrementMovesCount();
          counter.updateMovesProgress();
        }
      });

      puzzleTile.addEventListener('mousedown', (event) => {
        event.preventDefault();

        this.blankTileIndex = this.blankTile.getAttribute(constants.INDEX);
        this.curTileIndex = event.currentTarget.getAttribute(constants.INDEX);

        const moveDirection = this.tilesHelper.getMoveDirection(
          this.curTileIndex,
          this.blankTileIndex,
        );

        curTile = event.currentTarget;
        curTile.style.position = 'relative';
        let x;
        let y;
        const maxX = curTile.offsetWidth;
        const maxY = curTile.offsetHeight;
        const shiftX = event.clientX;
        const shiftY = event.clientY;

        function getTileNewCoordinates() {
          function getCoordInRangeNegative(coord, max) {
            if (coord < -max) return -max;
            if (coord > 0) return 0;
            return coord;
          }
          function getCoordInRangePositive(coord, max) {
            if (coord > max) return max;
            if (coord < 0) return 0;
            return coord;
          }
          switch (moveDirection) {
            case 'top':
              return { x: 0, y: getCoordInRangeNegative(y, maxY) };
            case 'bottom':
              return { x: 0, y: getCoordInRangePositive(y, maxY) };
            case 'left':
              return { x: getCoordInRangeNegative(x, maxX), y: 0 };
            case 'right':
              return { x: getCoordInRangePositive(x, maxX), y: 0 };
            default:
              return { x: 0, y: 0 };
          }
        }

        function moveAt(newX, newY) {
          x = newX - shiftX;
          y = newY - shiftY;
          const coords = getTileNewCoordinates();
          x = coords.x;
          y = coords.y;
          curTile.style.left = `${x}px`;
          curTile.style.top = `${y}px`;
        }

        function onMouseMove(e) {
          moveAt(e.pageX, e.pageY);
        }

        if (this.tilesHelper.isAdjacentTile(this.curTileIndex, this.blankTileIndex)) {
          document.addEventListener('mousemove', onMouseMove);

          document.onmouseup = () => {
            if (this.tilesHelper.isAdjacentTile(this.curTileIndex, this.blankTileIndex)) {
              curTile.style.left = '0px';
              curTile.style.top = '0px';

              const isInTheSamePosition = x === 0 && y === 0;

              if (x || y) {
                this.swapTilesOnDrag(curTile, this.blankTile);
              } else if (!isInTheSamePosition) {
                this.swapTilesOnClick(curTile, this.blankTile);
              }

              if (!isInTheSamePosition) {
                if (this.isSoundTurnedOn) {
                  this.tileAudio.play();
                }

                this.updateTilesArray(this.curTileIndex, this.blankTileIndex);

                if ((x || y) && this.tilesHelper.isSolved(this.tilesArr)) {
                  this.endGame();
                }

                counter.incrementMovesCount();
                counter.updateMovesProgress();
              }
            }

            document.removeEventListener('mousemove', onMouseMove);
            document.onmouseup = null;
          };
        }
      });

      curTile.ondragstart = () => false;
    });
  }

  swapTilesOnClick(curTile, blankTile) {
    const getTileClassWithDirection = () => {
      const moveDirection = this.tilesHelper.getMoveDirection(
        this.curTileIndex,
        this.blankTileIndex,
      );
      return `${constants.PUZZLE_CLASS}__tile-${moveDirection}`;
    };

    curTile.classList.add(getTileClassWithDirection());

    curTile.addEventListener('transitionend', () => {
      this.updateTilePosition(curTile, this.blankTileIndex);
      this.updateTilePosition(blankTile, this.curTileIndex);

      if (curTile.classList.contains(getTileClassWithDirection())) {
        curTile.classList.remove(getTileClassWithDirection());
        if (this.tilesHelper.isSolved(this.tilesArr)) {
          this.endGame();
        }
      }
    });
  }

  swapTilesOnDrag(curTile, blankTile) {
    this.updateTilePosition(curTile, this.blankTileIndex);
    this.updateTilePosition(blankTile, this.curTileIndex);
  }

  updateTilePosition(tile, newPosition) {
    tile.style.setProperty(constants.ORDER, newPosition);
    tile.setAttribute(constants.INDEX, newPosition);
    return this;
  }

  updateTilesArray(i, j) {
    [this.tilesArr[i], this.tilesArr[j]] = [this.tilesArr[j], this.tilesArr[i]];
  }

  endGame(isAutoSolved) {
    this.openWinMenu(isAutoSolved);
    if (!isAutoSolved) {
      this.saveResult();
    }
  }
}

export default PuzzleEngine;
