// TODO (zustand) - add in Immer middleware

import { isProduction, isTest } from 'utils/env-utils';

export const devtoolsOptions = (name: string) => {
    return {
        enabled: !isProduction && !isTest,
        name,
    };
};
