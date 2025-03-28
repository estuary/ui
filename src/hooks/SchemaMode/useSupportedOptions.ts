import { useMemo } from 'react';

import { useIntl } from 'react-intl';

import { choices } from 'src/components/editor/Bindings/SchemaMode/shared';
import type { AutoCompleteOption } from 'src/components/editor/Bindings/SchemaMode/types';

function useSupportedOptions(): AutoCompleteOption[] {
    const intl = useIntl();

    return useMemo(
        () =>
            choices.map((choice) => {
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

export default useSupportedOptions;
