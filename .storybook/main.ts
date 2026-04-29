import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
    addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
    framework: '@storybook/react-vite',
    core: {
        disableTelemetry: true,
    },
    async viteFinal(config) {
        // SRI and compression plugins break Storybook builds because Storybook
        // injects vite-inject-mocker-entry.js dynamically (not in the bundle).
        config.plugins = (config.plugins ?? []).filter((plugin) => {
            if (
                !plugin ||
                typeof plugin !== 'object' ||
                Array.isArray(plugin)
            ) {
                return true;
            }
            const name = (plugin as { name?: string }).name ?? '';
            return (
                name !== 'vite-plugin-sri3' &&
                name !== 'vite-plugin-compression2'
            );
        });
        return config;
    },
};

export default config;
