import { css } from '@emotion/react';
import { GameState } from '../App';

const styles = {
    root: css`
        position: absolute;
        width: 50vw;
        padding: 1rem;
        background: white;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        box-shadow: 0 0.5rem 2rem rgba(0, 0, 0, 0.5);
        z-index: 999;
    `,
};

interface Props {
    gameState: GameState;
    onRestart: () => void;
}

export default function EndScreen({ gameState, onRestart }: Props) {
    const player0Cards = gameState.grid.filter(gridItem => gridItem?.playerIndex === 0)
        .length;
    const player1Cards = gameState.grid.filter(gridItem => gridItem?.playerIndex === 1)
        .length;

    return (
        <div css={styles.root}>
            <h1>
                {(() => {
                    // TODO: use actual player names
                    if (player0Cards > player1Cards) {
                        return 'Player 0 wins!';
                    }
                    if (player1Cards > player0Cards) {
                        return 'Player 1 wins!';
                    }
                    return 'Draw! No winner!';
                })()}
            </h1>
            <button type="button" onClick={onRestart}>
                Restart
            </button>
        </div>
    );
}
