import type { Preview } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { useEffect } from 'react';

import ThemeProvider, { useColorMode } from '../src/context/Theme';

function StoryColorMode({
    mode,
    children,
}: {
    mode: string;
    children: ReactNode;
}) {
    const { colorMode, toggleColorMode } = useColorMode();

    useEffect(() => {
        if (colorMode !== mode) toggleColorMode();
    }, [colorMode, mode, toggleColorMode]);

    return <>{children}</>;
}

const preview: Preview = {
    globalTypes: {
        colorMode: {
            description: 'Dashboard color mode',
        },
    },
    initialGlobals: { colorMode: 'light' },
    decorators: [
        (Story, context) => (
            <ThemeProvider>
                <StoryColorMode mode={context.globals.colorMode}>
                    <Story />
                </StoryColorMode>
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
