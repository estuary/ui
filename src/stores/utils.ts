import { isEmpty, map } from 'lodash';

export const checkForErrors = (obj: any) =>
    obj?.errors && obj.errors.length > 0;

export const populateErrors = (configDictionary: any) => {
    let configErrors: any[] = [];

    // TODO (errors) When there are not configs do we need to populate this object with something?
    if (Object.keys(configDictionary).length > 0) {
        map(configDictionary, (config) => {
            if (checkForErrors(config)) {
                configErrors = configErrors.concat(config.errors);
            }
        });
    }

    return {
        configErrors,
        hasErrors: !isEmpty(configErrors),
    };
};
