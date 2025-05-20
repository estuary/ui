import type { AutoCompleteOptionForTargetSchema } from 'src/components/materialization/source/targetSchema/types';

import { useMemo } from 'react';

import { useIntl } from 'react-intl';

import {
    filterAliases,
    targetNamingOptions,
} from 'src/stores/SourceCapture/shared';

const filteredOptions = targetNamingOptions.filter(filterAliases);

function useTargetNamingOptions(): AutoCompleteOptionForTargetSchema[] {
    const intl = useIntl();

    return useMemo(
        () =>
            filteredOptions.map((choice) => {
                return {
                    description: intl.formatMessage({
                        id: `schemaMode.options.${choice}.description`,
                    }),
                    label: intl.formatMessage({
                        id: `schemaMode.options.${choice}.label`,
                    }),
                    val: choice,
                };
            }),
        [intl]
    );
}

export default useTargetNamingOptions;
