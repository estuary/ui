declare module 'storybook/internal/types' {
    export * from 'storybook/dist/types/index';
}

declare module '@storybook/react' {
    // eslint-disable-next-line import/no-extraneous-dependencies -- transitive dep of @storybook/react-vite; shimmed for moduleResolution:"node"
    export * from '@storybook/react/dist/index';
}

declare module '@storybook/react-vite' {
    export * from '@storybook/react-vite/dist/index';
}
