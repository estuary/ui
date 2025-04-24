import { isProduction } from 'src/utils/env-utils';

export const devtoolsOptions = (name: string) => {
    return {
        enabled:
            !isProduction &&
            window.__REDUX_DEVTOOLS_EXTENSION__ &&
            window.__REDUX_DEVTOOLS_EXTENSION__(),
        name,
    };
};
