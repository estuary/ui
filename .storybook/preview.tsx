import type { Preview } from '@storybook/react-vite';

import React from 'react';

import ThemeProvider from '../src/context/Theme';

const preview: Preview = {
    decorators: [
        (Story) => (
            <ThemeProvider>
                <Story />
            </ThemeProvider>
        ),
    ],
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;
