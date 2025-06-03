import type { AutoCompleteOptionForIncompatibleSchemaChange } from 'src/components/incompatibleSchemaChange/types';

import { useMemo } from 'react';

import { useIntl } from 'react-intl';

import { choices } from 'src/components/incompatibleSchemaChange/shared';

function useSupportedOptions(): AutoCompleteOptionForIncompatibleSchemaChange[] {
    const intl = useIntl();

    return useMemo(
        () =>
            choices.map((choice) => {
                return {
                    description: intl.formatMessage({
                        id: `incompatibleSchemaChange.options.${choice}.description`,
                    }),
                    label: intl.formatMessage({
                        id: `incompatibleSchemaChange.options.${choice}.label`,
                    }),
                    val: choice,
                };
            }),
        [intl]
    );
}

export default useSupportedOptions;
