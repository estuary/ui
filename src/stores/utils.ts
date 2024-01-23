import { isEmpty, map } from 'lodash';
import { ResourceConfigDictionary } from './ResourceConfig/types';

export const checkForErrors = (obj: any) =>
    obj?.errors && obj.errors.length > 0;

export const populateErrors = (
    configDictionary: ResourceConfigDictionary | any
) => {
    let configErrors: any[] = [];

    const configs = Array.isArray(configDictionary)
        ? configDictionary.map(([_name, config]) => config)
        : // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          Object.entries(configDictionary)?.map((config) => config);

    // TODO (errors) When there are not configs do we need to populate this object with something?
    if (configs.length > 0) {
        map(configs, (config) => {
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
