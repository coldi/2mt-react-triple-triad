/* eslint-disable jsx-a11y/click-events-have-key-events */
import { HTMLMotionProps } from 'framer-motion';
import { CardType } from '../App';
import Card from './Card';

interface Props {
    card: CardType;
    playerIndex: number;
    onPlacedOnGrid?: () => void;
}

export default function GridCard({ card, playerIndex, onPlacedOnGrid }: Props) {
    const animation: HTMLMotionProps<'div'> = {
        initial: {
            x: 0,
            y: -window.innerHeight,
        },
        animate: {
            x: 0,
            y: 0,
        },
        transition: {
            stiffness: 150,
            delay: 0.25,
        },
    };

    function handlePlacedOnGrid() {
        onPlacedOnGrid?.();
    }

    return (
        <Card
            card={card}
            playerIndex={playerIndex}
            {...animation}
            onAnimationComplete={handlePlacedOnGrid}
        />
    );
}
