import { beforeEach, describe, expect, it } from 'vitest';
import { loadScoreboard, saveScoreboard } from './storage';

const KEY = 'tic-tac-toe.scoreboard';

describe('scoreboard storage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('returns null when nothing has been saved', () => {
    expect(loadScoreboard()).toBeNull();
  });

  it('loads what was saved', () => {
    saveScoreboard({ xWins: 2, oWins: 1, draws: 3 });
    expect(loadScoreboard()).toEqual({ xWins: 2, oWins: 1, draws: 3 });
  });

  it('ignores data that is not valid JSON', () => {
    sessionStorage.setItem(KEY, '{not json');
    expect(loadScoreboard()).toBeNull();
  });

  it('ignores data with the wrong shape', () => {
    sessionStorage.setItem(KEY, JSON.stringify({ xWins: -1, oWins: 'two', draws: 0 }));
    expect(loadScoreboard()).toBeNull();
  });
});
