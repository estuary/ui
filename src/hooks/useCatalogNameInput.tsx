import { useMemo } from 'react';
import { useIntl } from 'react-intl';

function useCatalogNameInput() {
    const intl = useIntl();

    const catalogNameSchema = useMemo(() => {
        return {
            description: intl.formatMessage({
                id: 'entityName.description',
            }),

            // This pattern needs to match https://github.com/estuary/animated-carnival/blob/main/supabase/migrations/03_catalog-types.sql
            //     as close as possible. We just alter it to handle that we know the list of allowed prefix values
            //     this means that it handles the first portion of the name.
            // `^([a-zA-Z0-9-_.]+/)+[a-zA-Z0-9-_.]+$`
            type: 'string',
        };
    }, [intl]);

    return {
        catalogNameSchema,
    };
}

export default useCatalogNameInput;
