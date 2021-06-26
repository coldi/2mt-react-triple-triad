/* eslint-disable jsx-a11y/click-events-have-key-events */
import { HTMLMotionProps } from 'framer-motion';
import { useRef } from 'react';
import { CardType } from '../App';
import Card from './Card';

interface Props {
    card: CardType;
    playerIndex: number;
    deckOrderIndex?: number;
    covered?: boolean;
    selected?: boolean;
    onClick?: (deckIndex: number) => void;
}

export default function DeckCard({
    card,
    playerIndex,
    deckOrderIndex,
    covered,
    selected,
    onClick,
}: Props) {
    const element = useRef<HTMLDivElement>();
    const alignment =
        element.current?.getBoundingClientRect().left < window.innerWidth / 2 ? 1 : -1;

    const animation: HTMLMotionProps<'div'> = {
        animate: {
            rotateY: covered ? 180 : 0,
            x: selected ? 20 * alignment : 0,
        },
        exit: {
            x: 100 * alignment,
            y: -window.innerHeight,
        },
    };

    function handleClick() {
        onClick?.(deckOrderIndex);
    }

    return (
        <Card
            ref={element}
            card={card}
            playerIndex={playerIndex}
            {...animation}
            onClick={handleClick}
        />
    );
}
