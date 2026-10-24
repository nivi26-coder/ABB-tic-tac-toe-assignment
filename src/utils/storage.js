const SCOREBOARD_KEY = 'tic-tac-toe.scoreboard';

const isCount = (n) => Number.isInteger(n) && n >= 0;

// sessionStorage can be blocked (private mode, strict cookie settings) or hold
// unexpected data, so anything odd just means starting from a fresh scoreboard.
export function loadScoreboard() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(SCOREBOARD_KEY));
    if (saved && isCount(saved.xWins) && isCount(saved.oWins) && isCount(saved.draws)) {
      return { xWins: saved.xWins, oWins: saved.oWins, draws: saved.draws };
    }
  } catch {
    // fall through to null
  }
  return null;
}

export function saveScoreboard(scoreboard) {
  try {
    sessionStorage.setItem(SCOREBOARD_KEY, JSON.stringify(scoreboard));
  } catch {
    // the score simply won't survive a refresh
  }
}
