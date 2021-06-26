/* eslint-disable no-useless-return */
/* eslint-disable no-param-reassign */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { css, Global, ThemeProvider } from '@emotion/react';
import { AnimatePresence } from 'framer-motion';
import produce from 'immer';
import React, { useEffect, useState } from 'react';
import DeckCard from './components/DeckCard';
import EndScreen from './components/EndScreen';
import GridCard from './components/GridCard';
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

export interface GameState {
    turnIndex: number;
    startingOffset: number;
    locked: boolean;
    showEndScreen: boolean;
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

const getInitialState = (): GameState => {
    const shuffledCards = cards.slice().sort(() => 0.5 - Math.random());

    return {
        turnIndex: 0,
        startingOffset: Math.round(Math.random()),
        locked: false,
        showEndScreen: false,
        players: [
            {
                name: 'Tom',
                selectedCardIndex: null,
                deck: shuffledCards.slice(0, 5).map(card => ({
                    cardId: card.id,
                })),
            },
            {
                name: 'Evil Computer',
                isComputer: true,
                selectedCardIndex: null,
                deck: shuffledCards.slice(5, 10).map(card => ({
                    cardId: card.id,
                })),
            },
        ],
        grid: Array.from({ length: gridSize * gridSize }),
    };
};

export default function App() {
    const [gameState, setGameState] = useState<GameState>(getInitialState);

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
                // place deck card on grid
                draft.grid[gridIndex] = {
                    ...card,
                    playerIndex: currentPlayerIndex,
                };
                // remove card from deck
                draft.players[currentPlayerIndex].deck.splice(selectedCardIndex, 1);
                // reset selected card
                draft.players[currentPlayerIndex].selectedCardIndex = null;
            })
        );
    }

    function takeOverNeighborCards(gridIndex: number) {
        setGameState(
            produce(draft => {
                const gridItem = gameState.grid[gridIndex];
                // take over neighbor card logic
                const neighbors = getNeighborsOnGrid(gridIndex);
                neighbors.forEach((neighborIndex, directionIndex) => {
                    if (neighborIndex == null) return;
                    const neighborCard = draft.grid[neighborIndex];
                    if (neighborCard == null) return;
                    const ownRankIndex = directionIndex;
                    const neighborRankIndex = (directionIndex + 2) % 4;
                    const ownRank = getCardById(gridItem.cardId).ranks[ownRankIndex];
                    const neighborRank = getCardById(neighborCard.cardId).ranks[neighborRankIndex];
                    if (ownRank > neighborRank) {
                        neighborCard.playerIndex = currentPlayerIndex;
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

    function restartGame() {
        setGameState(getInitialState);
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
            setGameState(current => ({ ...current, locked: true }));

            if (findFreeIndexOnGrid() === -1) {
                await waitForMs(1000);
                setGameState(current => ({ ...current, showEndScreen: true }));
                return;
            }

            const currentPlayer = getCurrentPlayer();
            if (currentPlayer.isComputer) {
                const selectedCardIndex = Math.floor(currentPlayer.deck.length * Math.random());
                selectCard(selectedCardIndex);

                await waitForMs(1000);

                const freeIndex = findFreeIndexOnGrid();
                if (freeIndex >= 0) {
                    placeDeckCardOnGrid(freeIndex, selectedCardIndex);
                } else {
                    // no free index remaining. game end?
                }
            } else {
                // human player turn
            }

            setGameState(current => ({ ...current, locked: false }));
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
                            <DeckCard
                                key={item.cardId}
                                playerIndex={0}
                                deckOrderIndex={index}
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
                            <DeckCard
                                key={item.cardId}
                                playerIndex={1}
                                deckOrderIndex={index}
                                card={getCardById(item.cardId)}
                                selected={gameState.players[1].selectedCardIndex === index}
                                covered
                            />
                        ))}
                    </AnimatePresence>
                </div>

                <main css={styles.grid}>
                    {gameState.grid.map((gridItem, gridIndex) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <div key={gridIndex} onClick={() => handleGridClick(gridIndex)}>
                            {gridItem && (
                                <GridCard
                                    card={getCardById(gridItem.cardId)}
                                    playerIndex={gridItem.playerIndex}
                                    onPlacedOnGrid={() => takeOverNeighborCards(gridIndex)}
                                />
                            )}
                        </div>
                    ))}
                </main>

                {gameState.showEndScreen && <EndScreen gameState={gameState} onRestart={restartGame} />}
            </div>
        </ThemeProvider>
    );
}
