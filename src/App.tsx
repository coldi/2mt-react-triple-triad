/* eslint-disable no-param-reassign */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { css, Global, ThemeProvider } from '@emotion/react';
import produce from 'immer';
import React, { useEffect, useRef, useState } from 'react';
import Card from './components/Card';
import globalStyles from './styles/global';
import theme from './styles/theme';

const styles = {
    deckLeft: css`
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
    `,
    deckRight: css`
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
    `,
    grid: css`
        display: flex;
        position: absolute;
        left: 50%;
        top: 50%;
        width: 36em;
        height: 36em;
        transform: translate(-50%, -50%);
        flex-wrap: wrap;
        & > div {
            // TODO: use theme variable
            width: 10em;
            height: 10em;
            border: 2px white dashed;
            margin: 0.5em;
        }
    `,
};

const cards: CardType[] = [
    {
        id: 'abas',
        image: 'assets/cards/Abas.png',
        ranks: [8, 2, 5, 3],
    },
    {
        id: 'astraeus',
        image: 'assets/cards/Astraeus.png',
        ranks: [7, 2, 8, 4],
    },
    {
        id: 'cecrops',
        image: 'assets/cards/Cecrops.png',
        ranks: [1, 5, 3, 7],
    },
    {
        id: 'eos',
        image: 'assets/cards/Eos.png',
        ranks: [8, 2, 1, 9],
    },
    {
        id: 'griffin',
        image: 'assets/cards/Griffin.png',
        ranks: [5, 6, 1, 6],
    },
    {
        id: 'hephaestus',
        image: 'assets/cards/Hephaestus.png',
        ranks: [7, 7, 1, 4],
    },
    {
        id: 'lapetus',
        image: 'assets/cards/Lapetus.png',
        ranks: [3, 2, 7, 6],
    },
    {
        id: 'mati',
        image: 'assets/cards/Mati.png',
        ranks: [8, 3, 4, 7],
    },
    {
        id: 'ourea',
        image: 'assets/cards/Ourea.png',
        ranks: [5, 1, 8, 4],
    },
    {
        id: 'phoebe',
        image: 'assets/cards/Phoebe.png',
        ranks: [1, 7, 9, 4],
    },
    {
        id: 'styx',
        image: 'assets/cards/Styx.png',
        ranks: [1, 8, 6, 3],
    },
    {
        id: 'taurus',
        image: 'assets/cards/Taurus.png',
        ranks: [4, 8, 4, 6],
    },
];

function getCardById(id: string) {
    return cards.find(card => card.id === id);
}

interface GameState {
    turnIndex: number;
    startingOffset: number;
    players: {
        deck: { cardId: string }[];
        selectedCardIndex?: number;
        name?: string;
        isComputer?: boolean;
    }[];
    grid: ({
        cardId: string;
        playerIndex: number;
    } | null)[];
}

export interface CardType {
    id: string;
    ranks: [number, number, number, number]; // top, right, bottom, left
    image: string;
}

const gridSize = 3;

const waitForMs = (delay: number) => new Promise(resolve => setTimeout(resolve, delay));

export default function App() {
    const [gameState, setGameState] = useState<GameState>(() => {
        return {
            turnIndex: 0,
            startingOffset: 0,
            players: [
                {
                    name: 'Tom',
                    selectedCardIndex: null,
                    deck: cards.slice(0, 5).map(card => ({
                        cardId: card.id,
                    })),
                },
                {
                    name: 'Evil Computer',
                    isComputer: true,
                    selectedCardIndex: null,
                    deck: cards.slice(5, 10).map(card => ({
                        cardId: card.id,
                    })),
                },
            ],
            grid: Array.from({ length: gridSize * gridSize }),
        };
    });
    const updatedTurnIndex = useRef(gameState.turnIndex);

    const currentPlayerIndex = (gameState.turnIndex + gameState.startingOffset) % gameState.players.length;

    function selectCard(deckIndex: number) {
        setGameState(
            produce(draft => {
                draft.players[currentPlayerIndex].selectedCardIndex = deckIndex;
            })
        );
    }

    function getCurrentPlayer() {
        return gameState.players[currentPlayerIndex];
    }

    function placeDeckCardOnGrid(gridIndex: number, cardIndex?: number) {
        if (gameState.grid[gridIndex] != null) return;

        // TODO: add getCurrentPlayer() ?
        let { selectedCardIndex } = getCurrentPlayer();
        if (cardIndex != null) selectedCardIndex = cardIndex;

        if (selectedCardIndex == null) return;
        setGameState(
            produce(draft => {
                const card = getCurrentPlayer().deck[selectedCardIndex];
                draft.grid[gridIndex] = {
                    ...card,
                    playerIndex: currentPlayerIndex,
                };
                draft.players[currentPlayerIndex].deck.splice(selectedCardIndex, 1);
                draft.players[currentPlayerIndex].selectedCardIndex = null;

                draft.turnIndex += 1;
            })
        );
    }

    function findFreeIndexOnGrid() {
        const freeIndices = [];
        gameState.grid.forEach((item, index) => {
            if (item == null) freeIndices.push(index);
        });
        const freeIndex = Math.floor(freeIndices.length * Math.random());
        return freeIndices[freeIndex];
    }

    // handle turn logic
    useEffect(() => {
        if (updatedTurnIndex.current === gameState.turnIndex) return;
        /* eslint-disable no-console */
        console.log('new turn:', gameState.turnIndex);
        console.log('current player:', getCurrentPlayer().name);
        /* eslint-enable no-console */

        (async () => {
            // TODO: introduce `locked` state
            const currentPlayer = getCurrentPlayer();
            if (currentPlayer.isComputer) {
                const selectedCardIndex = Math.floor(currentPlayer.deck.length * Math.random());
                selectCard(selectedCardIndex);
                await waitForMs(700);

                const freeIndex = findFreeIndexOnGrid();
                placeDeckCardOnGrid(freeIndex, selectedCardIndex);
                // TODO: evaluate neighbor cards and ranks
            } else {
                // human player turn
            }
        })();
    });

    // sync updated turn index with game sate
    useEffect(() => {
        // it's important that this useEffect callback happens *after*
        // the useEffect with the actual turn logic.
        updatedTurnIndex.current = gameState.turnIndex;
    }, [gameState.turnIndex]);

    return (
        <ThemeProvider theme={theme}>
            <Global styles={globalStyles} />
            <div>
                <p>Let&apos;s start with Triple Triad in React</p>

                <div css={styles.deckLeft}>
                    <div>
                        {gameState.players[0].deck.map((item, index) => (
                            <Card
                                key={item.cardId}
                                deckIndex={index}
                                card={getCardById(item.cardId)}
                                selected={gameState.players[0].selectedCardIndex === index}
                                onClick={selectCard}
                            />
                        ))}
                    </div>
                </div>

                <div css={styles.deckRight}>
                    <div>
                        {gameState.players[1].deck.map((item, index) => (
                            <Card
                                key={item.cardId}
                                deckIndex={index}
                                card={getCardById(item.cardId)}
                                selected={gameState.players[1].selectedCardIndex === index}
                                covered
                            />
                        ))}
                    </div>
                </div>

                <main css={styles.grid}>
                    {gameState.grid.map((item, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <div key={index} onClick={() => placeDeckCardOnGrid(index)}>
                            {item && <Card card={getCardById(item.cardId)} />}
                        </div>
                    ))}
                </main>
            </div>
        </ThemeProvider>
    );
}
