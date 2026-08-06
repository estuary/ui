import type { Preview } from '@storybook/react-vite';

import ThemeProvider from '../src/context/Theme';
import { LocalStorageKeys } from '../src/utils/localStorage-utils';

// ThemeProvider reads the colour mode from local storage, falling back to the
// OS preference. Seeding it from `?theme=` before the provider mounts makes both
// themes reachable by URL, which is what lets a screenshot pass drive them.
const seedColorModeFromUrl = () => {
    const theme = new URLSearchParams(window.location.search).get('theme');

    if (theme === 'dark' || theme === 'light') {
        window.localStorage.setItem(
            LocalStorageKeys.COLOR_MODE,
            JSON.stringify(theme)
        );
    }
};

seedColorModeFromUrl();

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
