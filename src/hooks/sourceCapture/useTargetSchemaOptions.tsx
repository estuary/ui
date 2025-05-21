import type { ReactNode } from 'react';
import type { AutoCompleteOptionForTargetSchema } from 'src/components/materialization/source/targetSchema/types';

import { useMemo } from 'react';

import { useIntl } from 'react-intl';

import { filteredTargetNamingOptions } from 'src/stores/SourceCapture/shared';

function useTargetSchemaOptions(): AutoCompleteOptionForTargetSchema[] {
    const intl = useIntl();

    return useMemo(
        () =>
            filteredTargetNamingOptions.map((choice) => {
                let description: ReactNode | string;
                if (choice === 'prefixNonDefaultSchema') {
                    description = (
                        <>
                            {intl.formatMessage(
                                {
                                    id: `schemaMode.options.prefixNonDefaultSchema.description`,
                                },
                                {
                                    defaultSchema: (
                                        <code>
                                            {intl.formatMessage({
                                                id: 'schemaMode.options.prefixNonDefaultSchema.ignored',
                                            })}
                                        </code>
                                    ),
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
                    );
                } else {
                    description = intl.formatMessage({
                        id: `schemaMode.options.${choice}.description`,
                    });
                }

                return {
                    description,
                    example: {
                        schema: intl.formatMessage({
                            id: `schemaMode.options.${choice}.example.schema`,
                        }),
                        table: intl.formatMessage({
                            id: `schemaMode.options.${choice}.example.table`,
                        }),
                    },
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
