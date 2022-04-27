// TODO (zustand) - add in Immer middleware
// https://github.com/pmndrs/zustand#middleware
// https://github.com/pmndrs/zustand/blob/main/tests/middlewareTypes.test.tsx

export const devtoolsOptions = (name: string) => {
    return {
        enabled:
            process.env.NODE_ENV !== 'production' &&
            process.env.NODE_ENV !== 'test',
        name,
    };
};
