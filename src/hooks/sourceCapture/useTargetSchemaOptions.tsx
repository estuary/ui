import type { AutoCompleteOptionForTargetSchema } from 'src/components/materialization/source/targetSchema/types';

import { useMemo } from 'react';

import { useIntl } from 'react-intl';

import { filteredTargetNamingOptions } from 'src/stores/SourceCapture/shared';

function useTargetSchemaOptions(): AutoCompleteOptionForTargetSchema[] {
    const intl = useIntl();

    return useMemo(
        () =>
            filteredTargetNamingOptions.map((choice) => {
                if (choice === 'prefixNonDefaultSchema') {
                    return {
                        description: (
                            <>
                                {intl.formatMessage(
                                    {
                                        id: `schemaMode.options.prefixNonDefaultSchema.description`,
                                    },
                                    {
                                        defaultSchema: <code>public</code>,
                                        highlight: (
                                            <strong>
                                                {intl.formatMessage({
                                                    id: `schemaMode.options.prefixNonDefaultSchema.description.highlight`,
                                                })}
                                            </strong>
                                        ),
                                    }
                                )}
                            </>
                        ),
                        label: intl.formatMessage({
                            id: `schemaMode.options.${choice}.label`,
                        }),
                        val: choice,
                    };
                }
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

export default useTargetSchemaOptions;
