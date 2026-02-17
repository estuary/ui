import { getArrayContext } from 'src/forms/shared';

/**
 * Constructs a virtual config for OAuth flows initiated from within array items.
 * Promotes scalar fields from the current array item to the top level of the
 * config, allowing Mustache templates like {{{ config.store }}} to resolve
 * correctly when the actual data lives at stores[N].store.
 */
export const buildVirtualConfig = (
    endpointConfigData: Record<string, any>,
    credentialsPath: string
): Record<string, any> => {
    const arrayContext = getArrayContext(credentialsPath);

    if (!arrayContext) {
        return endpointConfigData;
    }

    const { arrayField, index } = arrayContext;
    const arrayItems = endpointConfigData[arrayField];

    if (!Array.isArray(arrayItems) || !arrayItems[index]) {
        return endpointConfigData;
    }

    const currentItem = arrayItems[index];
    const virtualConfig = { ...endpointConfigData };

    for (const [key, value] of Object.entries(currentItem)) {
        if (
            value === null ||
            value === undefined ||
            typeof value !== 'object'
        ) {
            virtualConfig[key] = value;
        }
    }

    return virtualConfig;
};
