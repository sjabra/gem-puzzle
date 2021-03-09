function clone(arr) {
  return arr.map((item) => item);
}

function shuffle(arr) {
  const shuffledArr = arr;
  for (let i = shuffledArr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArr[i], shuffledArr[j]] = [shuffledArr[j], shuffledArr[i]];
  }
  return shuffledArr;
}

function createElement(elTag, elClass) {
  const elem = document.createElement(elTag);
  if (elClass) {
    elem.classList.add(elClass);
  }
  return elem;
}

function addLeadingZero(number) {
  return number <= 9 ? `0${number}` : number;
}

function formatTime(seconds) {
  let hour;
  let minutes = Math.floor(seconds / 60);
  if (minutes > 59) {
    hour = Math.floor(minutes / 60);
    minutes -= 60 * hour;
  }
  const sec = seconds - 60 * minutes;
  return hour
    ? `${hour}:${addLeadingZero(minutes)}:${addLeadingZero(sec)}`
    : `${minutes}:${addLeadingZero(sec)}`;
}

function timestampToDate(timestamp) {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('default', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).format(date);
}

function isEven(number) {
  return number % 2 === 0;
}

function isOdd(number) {
  return !isEven(number);
}

export {
  createElement, formatTime, timestampToDate, clone, shuffle, isOdd, isEven,
};
