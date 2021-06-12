/* eslint-disable no-useless-return */
/* eslint-disable no-param-reassign */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { css, Global, ThemeProvider } from '@emotion/react';
import { AnimatePresence } from 'framer-motion';
import produce from 'immer';
import React, { useEffect, useState } from 'react';
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
    locked: boolean;
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
            locked: false,
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

    function getNeighborsOnGrid(gridIndex: number) {
        const leftIndex = gridIndex - 1;
        const left = gridIndex % gridSize === 0 ? null : leftIndex;

        const rightIndex = gridIndex + 1;
        const right = gridIndex % gridSize === gridSize - 1 ? null : rightIndex;

        const topIndex = gridIndex - gridSize;
        const top = topIndex < 0 ? null : topIndex;

        const bottomIndex = gridIndex + gridSize;
        const bottom = bottomIndex >= gridSize * gridSize ? null : bottomIndex;

        return [top, right, bottom, left];
    }

    function placeDeckCardOnGrid(gridIndex: number, cardIndex?: number) {
        if (gameState.grid[gridIndex] != null) return;

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

                const neighbors = getNeighborsOnGrid(gridIndex);
                neighbors.forEach((neighborIndex, directionIndex) => {
                    if (neighborIndex == null) return;
                    const neighborCard = gameState.grid[neighborIndex];
                    if (neighborCard == null) return;
                    const ownRankIndex = directionIndex;
                    const neigborRankIndex = (directionIndex + 2) % 4;
                    const ownRank = getCardById(card.cardId).ranks[ownRankIndex];
                    const neigborRank = getCardById(neighborCard.cardId).ranks[neigborRankIndex];
                    if (ownRank > neigborRank) {
                        // TODO: take over neighbor card
                        console.log('card on', neighborIndex, 'taken over!!');
                    }
                });

                draft.turnIndex += 1;
            })
        );
    }

    function findFreeIndexOnGrid() {
        const freeIndices = [];
        gameState.grid.forEach((item, index) => {
            if (item == null) freeIndices.push(index);
        });
        // no free index available?
        if (freeIndices.length === 0) return -1;

        const freeIndex = Math.floor(freeIndices.length * Math.random());
        return freeIndices[freeIndex];
    }

    function handleGridClick(gridIndex: number) {
        if (!gameState.locked) {
            placeDeckCardOnGrid(gridIndex);
        }
    }

    // handle turn logic and run only when turnIndex changed
    useEffect(() => {
        // if (updatedTurnIndex.current === gameState.turnIndex) return;
        /* eslint-disable no-console */
        console.log('new turn:', gameState.turnIndex);
        console.log('current player:', getCurrentPlayer().name);
        /* eslint-enable no-console */

        (async () => {
            const currentPlayer = getCurrentPlayer();
            if (currentPlayer.isComputer) {
                const selectedCardIndex = Math.floor(currentPlayer.deck.length * Math.random());
                selectCard(selectedCardIndex);

                setGameState(current => ({ ...current, locked: true }));
                await waitForMs(1000);

                const freeIndex = findFreeIndexOnGrid();
                if (freeIndex >= 0) {
                    placeDeckCardOnGrid(freeIndex, selectedCardIndex);
                    setGameState(current => ({ ...current, locked: false }));
                } else {
                    // no free index remaining. game end?
                }
            } else {
                // human player turn
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState.turnIndex]);

    return (
        <ThemeProvider theme={theme}>
            <Global styles={globalStyles} />
            <div>
                <p>Let&apos;s start with Triple Triad in React</p>

                <div css={styles.deckLeft}>
                    <AnimatePresence>
                        {gameState.players[0].deck.map((item, index) => (
                            <Card
                                key={item.cardId}
                                deckIndex={index}
                                card={getCardById(item.cardId)}
                                selected={gameState.players[0].selectedCardIndex === index}
                                onClick={selectCard}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                <div css={styles.deckRight}>
                    <AnimatePresence>
                        {gameState.players[1].deck.map((item, index) => (
                            <Card
                                key={item.cardId}
                                deckIndex={index}
                                card={getCardById(item.cardId)}
                                selected={gameState.players[1].selectedCardIndex === index}
                                covered
                            />
                        ))}
                    </AnimatePresence>
                </div>

                <main css={styles.grid}>
                    {gameState.grid.map((item, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <div key={index} onClick={() => handleGridClick(index)}>
                            {item && <Card card={getCardById(item.cardId)} />}
                        </div>
                    ))}
                </main>
            </div>
        </ThemeProvider>
    );
}
