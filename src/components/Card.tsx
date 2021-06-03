/* eslint-disable jsx-a11y/click-events-have-key-events */
import { css } from '@emotion/react';
import { motion } from 'framer-motion';
import { CardType } from '../App';

// shamelessly copied from: https://codepen.io/edeesims/pen/iGDzk
const styles = {
    root: css`
        position: relative;
        // TODO: extract to theme variable
        width: 10em;
        height: 10em;
        perspective: 600px;
        user-select: none;
    `,
    content: css`
        position: absolute;
        width: 100%;
        height: 100%;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
        transform-style: preserve-3d;
        //transition: transform 0.3s;
    `,
    covered: css`
        //transform: rotateY(180deg);
    `,
    side: css`
        position: absolute;
        height: 100%;
        width: 100%;
        padding: 1rem;
        box-sizing: border-box;
        font-size: 2em;
        backface-visibility: hidden;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.25);
    `,
    image: css`
        position: absolute;
        right: 0;
        bottom: 0;
        image-rendering: pixelated;
        width: 50%;
        height: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
    `,
    ranks: css`
        span {
            position: absolute;
            padding: 0.2em;
            text-shadow: 0 0 4px rgba(255, 255, 255, 0.75);
        }
        span:nth-of-type(1) {
            left: 50%;
            top: 0;
            transform: translate(-50%, 0);
        }
        span:nth-of-type(2) {
            right: 0%;
            top: 50%;
            transform: translate(0, -50%);
        }
        span:nth-of-type(3) {
            left: 50%;
            bottom: 0;
            transform: translate(-50%, 0);
        }
        span:nth-of-type(4) {
            left: 0%;
            top: 50%;
            transform: translate(0, -50%);
        }
    `,
    front: css`
        padding: 1rem;
        background: white;
    `,
    back: css`
        color: white;
        background: gray;
        transform: rotateY(180deg);
    `,
};

interface Props {
    card: CardType;
    deckIndex?: number;
    covered?: boolean;
    selected?: boolean;
    onClick?: (index: number) => void;
}

export default function Card({ card, deckIndex, covered, selected, onClick }: Props) {
    const animation = {
        rotateY: covered ? 180 : 0,
        x: selected ? 20 : 0,
    };

    function handleClick() {
        onClick?.(deckIndex);
    }

    return (
        <div role="button" css={styles.root} onClick={handleClick}>
            <motion.div css={styles.content} animate={animation}>
                <div css={[styles.side, styles.front]}>
                    <div css={styles.ranks}>
                        {card.ranks.map((rank, index) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <span key={index}>{rank}</span>
                        ))}
                    </div>
                    <img css={styles.image} src={card.image} alt={card.id} />
                </div>
                <div css={[styles.side, styles.back]}>Back</div>
            </motion.div>
        </div>
    );
}
