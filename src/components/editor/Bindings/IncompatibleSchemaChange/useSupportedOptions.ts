import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { choices } from './shared';
import { AutoCompleteOption } from './types';

function useSupportedOptions(): AutoCompleteOption[] {
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
