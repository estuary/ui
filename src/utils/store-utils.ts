export const devtoolsOptions = (name: string) => {
    return {
        enabled: !import.meta.env.PROD,
        name,
    };
};
