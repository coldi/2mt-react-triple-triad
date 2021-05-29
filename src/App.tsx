import { Global, ThemeProvider } from '@emotion/react';
import React from 'react';
import globalStyles from './styles/global';
import theme from './styles/theme';

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <Global styles={globalStyles} />
            <p>Let&apos;s start with Triple Triad in React</p>
        </ThemeProvider>
    );
}
