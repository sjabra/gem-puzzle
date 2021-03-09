const constants = {
  PUZZLE_WRAPPER_CLASS: 'puzzle-wrapper',
  PUZZLE_CLASS: 'puzzle',
  CSS_TILES_COUNT_PROP: '--tiles-count',

  DEFAULT_TILES_COUNT: 4,
  MAX_SAVES_COUNT: 10,
  ONE_SECOND: 1000,

  SAVES_STORAGE_NAME: 'sjabra-gem-puzzle-saved-games',
  BEST_RESULTS_STORAGE_NAME: 'sjabra-gem-puzzle-best-results',

  DATA_QA: 'data-qa',
  INDEX: 'index',
  ORDER: 'order',

  PICTURES_COUNT: 150,

  PUZZLE_TYPE: Object.freeze({ NUMBERS: 'Numbers', PICTURES: 'Pictures' }),
  PUZZLE_SIZES: [3, 4, 5, 6, 7, 8],
};

export default constants;
