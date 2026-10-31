import type { Preview } from '@storybook/react-vite';

// The app loads this in its route guards, which stories never mount.
import 'react-reflex/styles.css';

import ThemeProvider from '../src/context/Theme';
import { LocalStorageKeys } from '../src/utils/localStorage-utils';

const preview: Preview = {
    decorators: [
        (Story, context) => {
            const mode = context.globals.theme === 'dark' ? 'dark' : 'light';

            // The app's ThemeProvider reads its mode from localStorage once, on
            // mount. Store the toolbar's choice there, and key the provider on
            // it so switching remounts the provider and it reads the new mode.
            localStorage.setItem(
                LocalStorageKeys.COLOR_MODE,
                JSON.stringify(mode)
            );

            return (
                <ThemeProvider key={mode}>
                    <Story />
                </ThemeProvider>
            );
        },
    ],
    globalTypes: {
        theme: {
            description: 'Color mode of the app theme',
            toolbar: {
                title: 'Theme',
                icon: 'sun',
                items: [
                    { value: 'light', title: 'Light', icon: 'sun' },
                    { value: 'dark', title: 'Dark', icon: 'moon' },
                ],
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: {
        theme: 'light',
    },
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
