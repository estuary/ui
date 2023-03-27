import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { PREFIX_NAME_PATTERN } from 'utils/misc-utils';
import useCombinedGrantsExt from './useCombinedGrantsExt';

function useCatalogNameInput() {
    const intl = useIntl();

    const { combinedGrants } = useCombinedGrantsExt({
        adminOnly: true,
    });

    const accessGrantsOneOf = useMemo(() => {
        const response = [] as string[];

        if (combinedGrants.length > 0) {
            combinedGrants.forEach((accessGrant) => {
                response.push(accessGrant.object_role);
            });
        }

        return response;
    }, [combinedGrants]);

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
