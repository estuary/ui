import { isProduction } from './env-utils';

export const devtoolsOptions = (name: string) => {
    return {
        enabled: !isProduction,
        name,
    };
};
