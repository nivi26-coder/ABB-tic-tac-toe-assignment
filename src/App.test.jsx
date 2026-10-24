import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';

const cell = (row, col) =>
  screen.getByRole('button', { name: new RegExp(`^Row ${row}, Column ${col},`) });
const status = () => screen.getByRole('status');
const historyRows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1);
const score = (label) => screen.getByText(label).nextElementSibling;

const X_WINS_TOP_ROW = [
  [1, 1],
  [2, 1],
  [1, 2],
  [2, 2],
  [1, 3],
];

async function clickCells(user, cells) {
  for (const [row, col] of cells) {
    await user.click(cell(row, col));
  }
}

describe('App', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders an empty board with X to play', () => {
    render(<App />);

    const board = screen.getByRole('group', { name: 'Game board' });
    expect(within(board).getAllByRole('button')).toHaveLength(9);
    expect(status()).toHaveTextContent("Player X's turn");
    expect(screen.getByText('No moves yet. X goes first.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Two Player' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('places marks, locks the cell and records history', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(cell(1, 1));

    expect(cell(1, 1)).toHaveTextContent('X');
    expect(cell(1, 1)).toHaveAttribute('aria-disabled', 'true');
    expect(status()).toHaveTextContent("Player O's turn");
    expect(historyRows()).toHaveLength(1);
    expect(historyRows()[0]).toHaveTextContent('1XRow 1, Column 1');
  });

  it('ignores clicks on a filled cell', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(cell(1, 1));
    await user.click(cell(1, 1));

    expect(historyRows()).toHaveLength(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the winner, highlights the line and updates the score', async () => {
    const user = userEvent.setup();
    render(<App />);

    await clickCells(user, X_WINS_TOP_ROW);

    expect(status()).toHaveTextContent('Player X wins!');
    [cell(1, 1), cell(1, 2), cell(1, 3)].forEach((c) =>
      expect(c).toHaveAccessibleName(/, X, winning$/),
    );
    expect(cell(2, 1)).not.toHaveAccessibleName(/winning/);
    expect(cell(3, 3)).toHaveAttribute('aria-disabled', 'true');
    expect(score('X wins')).toHaveTextContent('1');
    expect(screen.getByRole('button', { name: 'Undo Last Move' })).toBeDisabled();
  });

  it('shows a draw', async () => {
    const user = userEvent.setup();
    render(<App />);

    await clickCells(user, [
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 2],
      [2, 1],
      [2, 3],
      [3, 2],
      [3, 1],
      [3, 3],
    ]);

    expect(status()).toHaveTextContent("It's a draw!");
    expect(score('Draws')).toHaveTextContent('1');
  });

  it('undoes the last move', async () => {
    const user = userEvent.setup();
    render(<App />);
    const undo = screen.getByRole('button', { name: 'Undo Last Move' });

    expect(undo).toBeDisabled();
    await clickCells(user, [
      [1, 1],
      [2, 2],
    ]);
    await user.click(undo);

    expect(cell(2, 2)).toHaveTextContent('');
    expect(status()).toHaveTextContent("Player O's turn");
    expect(historyRows()).toHaveLength(1);
  });

  it('resets the game without touching the scoreboard', async () => {
    const user = userEvent.setup();
    render(<App />);

    await clickCells(user, X_WINS_TOP_ROW);
    await user.click(screen.getByRole('button', { name: 'Reset Game' }));

    expect(status()).toHaveTextContent("Player X's turn");
    expect(cell(1, 1)).toHaveAttribute('aria-disabled', 'false');
    expect(screen.getByText('No moves yet. X goes first.')).toBeInTheDocument();
    expect(score('X wins')).toHaveTextContent('1');

    await user.click(screen.getByRole('button', { name: 'Reset Scoreboard' }));
    expect(score('X wins')).toHaveTextContent('0');
  });

  it('keeps the scoreboard after a page refresh', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await clickCells(user, X_WINS_TOP_ROW);
    unmount();
    render(<App />);

    expect(score('X wins')).toHaveTextContent('01');
  });

  it('lets the computer answer after a short pause', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Play vs Computer' }));
    await user.click(cell(1, 1));

    expect(status()).toHaveTextContent('Computer is thinking...');
    expect(cell(3, 3)).toHaveAttribute('aria-disabled', 'true');

    expect(await screen.findByRole('button', { name: /^Row 2, Column 2, O/ })).toBeInTheDocument();
    expect(status()).toHaveTextContent('Your turn (X)');
    expect(historyRows()).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Undo Last Move' }));
    expect(screen.getByText('No moves yet. X goes first.')).toBeInTheDocument();
  });

  it('can be played with the keyboard', async () => {
    const user = userEvent.setup();
    render(<App />);

    // two mode buttons, then the board is a single tab stop
    await user.tab();
    await user.tab();
    await user.tab();
    expect(cell(1, 1)).toHaveFocus();

    await user.keyboard('{ArrowRight}{ArrowDown}');
    expect(cell(2, 2)).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(cell(2, 2)).toHaveTextContent('X');
    expect(cell(2, 2)).toHaveFocus();

    await user.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
    expect(cell(1, 2)).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Undo Last Move' })).toHaveFocus();
  });
});
