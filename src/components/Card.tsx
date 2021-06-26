/* eslint-disable jsx-a11y/click-events-have-key-events */
import { css } from '@emotion/react';
import { HTMLMotionProps, motion } from 'framer-motion';
import { forwardRef, MouseEvent } from 'react';
import { CardType } from '../App';

const playerColors = ['#9BF', '#F98'];

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
            padding: 0.1em;
            line-height: 1;
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
    front: (playerIndex: number) => css`
        border: 0.75rem ${playerColors[playerIndex]} solid;
        // background: ${playerColors[playerIndex]};
        background: white;
    `,
    back: css`
        color: white;
        background: gray;
        background: linear-gradient(
            135deg,
            rgba(140, 140, 140, 1) 0%,
            rgba(100, 100, 100, 1) 100%
        );
        transform: rotateY(180deg);
    `,
};

interface Props extends HTMLMotionProps<'div'> {
    card: CardType;
    playerIndex: number;
    onClick?: (event: MouseEvent) => void;
}

export default forwardRef<HTMLDivElement, Props>(function Card(
    { card, playerIndex, onClick, ...props }: Props,
    forwardedRef
) {
    return (
        <div role="button" css={styles.root} onClick={onClick}>
            <motion.div ref={forwardedRef} css={styles.content} {...props}>
                <div css={[styles.side, styles.front(playerIndex)]}>
                    <div css={styles.ranks}>
                        {card.ranks.map((rank, index) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <span key={index}>{rank}</span>
                        ))}
                    </div>
                    <img css={styles.image} src={card.image} alt={card.id} />
                </div>
                <div css={[styles.side, styles.back]} />
            </motion.div>
        </div>
    );
});
