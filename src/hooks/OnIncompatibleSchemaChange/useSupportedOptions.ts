import { choices } from 'src/components/incompatibleSchemaChange/shared';
import { AutoCompleteOption } from 'src/components/incompatibleSchemaChange/types';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';

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
