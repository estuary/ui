export const devtoolsOptions = (name: string) => {
    return {
        enabled: process.env.NODE_ENV === 'development',
        name,
    };
};
