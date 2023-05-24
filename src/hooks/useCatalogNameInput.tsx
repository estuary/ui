import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';
import { PREFIX_NAME_PATTERN } from 'utils/misc-utils';

function useCatalogNameInput() {
    const intl = useIntl();

    const adminableCapabilities = useEntitiesStore_capabilities_adminable();

    const accessGrantsOneOf = useMemo(() => {
        const response = [] as string[];

        Object.keys(adminableCapabilities).forEach((adminPrefix) => {
            response.push(adminPrefix);
        });

        return response;
    }, [adminableCapabilities]);

    const catalogNameSchema = useMemo(() => {
        return {
            description: intl.formatMessage({
                id: 'entityName.description',
            }),

            // This pattern needs to match https://github.com/estuary/animated-carnival/blob/main/supabase/migrations/03_catalog-types.sql
            //     as close as possible. We just alter it to handle that we know the list of allowed prefix values
            //     this means that it handles the first portion of the name.
            // `^([a-zA-Z0-9-_.]+/)+[a-zA-Z0-9-_.]+$`
            examples: accessGrantsOneOf,
            type: 'string',
            pattern: `^(${accessGrantsOneOf.join(
                '|'
            )})(${PREFIX_NAME_PATTERN}/)*${PREFIX_NAME_PATTERN}$`,
        };
    }, [accessGrantsOneOf, intl]);

    return {
        catalogNameSchema,
    };
}

export default useCatalogNameInput;
