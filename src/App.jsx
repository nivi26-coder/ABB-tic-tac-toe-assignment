import Board from '@/components/Board';
import GameControls from '@/components/GameControls';
import GameStatus from '@/components/GameStatus';
import ModeSelector from '@/components/ModeSelector';
import MoveHistory from '@/components/MoveHistory';
import Panel from '@/components/Panel';
import Scoreboard from '@/components/Scoreboard';
import { STATUS } from '@/game/constants';
import { useTicTacToe } from '@/hooks/useTicTacToe';
import styles from './App.module.css';

export default function App() {
  const game = useTicTacToe();

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.tic}>Tic</span> <span className={styles.tac}>Tac</span>{' '}
          <span className={styles.toe}>Toe</span>
        </h1>
        <ModeSelector mode={game.mode} onChange={game.changeMode} />
      </header>

      <main className={styles.layout}>
        <div className={styles.gameColumn}>
          <Scoreboard scoreboard={game.scoreboard} className={styles.scoreboard} />

          <Panel title="Current game" hideTitle accent="gold" className={styles.playArea}>
            <GameStatus
              gameId={game.gameId}
              status={game.status}
              currentPlayer={game.currentPlayer}
              winner={game.winner}
              mode={game.mode}
            />

            <Board
              board={game.board}
              winningCells={game.winningCells}
              turn={game.currentPlayer}
              locked={game.status !== STATUS.IN_PROGRESS}
              waiting={game.isComputerTurn}
              onCellClick={game.playCell}
            />

            {game.error && (
              <p className={styles.error} role="alert">
                {game.error}
              </p>
            )}

            <GameControls
              canUndo={game.canUndo}
              onUndo={game.undo}
              onResetGame={game.resetGame}
              onResetScoreboard={game.resetScoreboard}
            />
          </Panel>
        </div>

        <MoveHistory moves={game.moves} className={styles.history} />
      </main>
    </div>
  );
}
