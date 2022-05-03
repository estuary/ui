// TODO (zustand) - add in Immer middleware

export const devtoolsOptions = (name: string) => {
    return {
        enabled:
            process.env.NODE_ENV !== 'production' &&
            process.env.NODE_ENV !== 'test',
        name,
    };
};
