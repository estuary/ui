import type { ReactNode } from 'react';
import type {
    AutoCompleteOptionForTargetSchema,
    AutoCompleteOptionForTargetSchemaExample,
} from 'src/components/materialization/source/targetSchema/types';

import { useMemo } from 'react';

import { Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import { TARGET_SCHEMA_HIGHLIGHT_CLASS } from 'src/components/materialization/source/targetSchema/shared';
import { filteredTargetNamingOptions } from 'src/stores/SourceCapture/shared';

function useTargetSchemaOptions(): AutoCompleteOptionForTargetSchema[] {
    const intl = useIntl();

    const publicTablePrefix = intl.formatMessage({
        id: `schemaMode.example.public.tablePrefix`,
    });
    const tablePrefix = intl.formatMessage({
        id: `schemaMode.example.tablePrefix`,
    });

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
                                                id: 'schemaMode.options.prefixNonDefaultSchema.ignored1',
                                            })}
                                        </code>
                                    ),
                                    defaultSchema2: (
                                        <code>
                                            {intl.formatMessage({
                                                id: 'schemaMode.options.prefixNonDefaultSchema.ignored2',
                                            })}
                                        </code>
                                    ),
                                    highlight: (
                                        <Typography
                                            component="span"
                                            sx={{ fontWeight: 500 }}
                                        >
                                            {intl.formatMessage({
                                                id: `schemaMode.options.prefixNonDefaultSchema.description.highlight`,
                                            })}
                                        </Typography>
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

                const detailedExamples =
                    choice === 'prefixSchema' ||
                    choice === 'prefixNonDefaultSchema';

                const highlightClass = detailedExamples
                    ? TARGET_SCHEMA_HIGHLIGHT_CLASS
                    : '';

                let publicExample:
                    | AutoCompleteOptionForTargetSchemaExample
                    | undefined;

                if (detailedExamples) {
                    publicExample = {
                        tablePrefix: (
                            <span className={highlightClass}>
                                {publicTablePrefix}
                            </span>
                        ),
                        schema: intl.formatMessage(
                            {
                                id: `schemaMode.options.${choice}.example.schema`,
                            },
                            {
                                tablePrefix: (
                                    <span className={highlightClass}>
                                        {publicTablePrefix}
                                    </span>
                                ),
                            }
                        ),
                        table: intl.formatMessage(
                            {
                                id: `schemaMode.options.${choice}.example.public.table`,
                            },
                            {
                                tablePrefix: (
                                    <span
                                        className={highlightClass}
                                    >{`${publicTablePrefix}_`}</span>
                                ),
                            }
                        ),
                    };
                }

                return {
                    description,
                    example: {
                        tablePrefix: (
                            <span className={highlightClass}>
                                {tablePrefix}
                            </span>
                        ),
                        schema: intl.formatMessage(
                            {
                                id: `schemaMode.options.${choice}.example.schema`,
                            },
                            {
                                tablePrefix: (
                                    <span className={highlightClass}>
                                        {tablePrefix}
                                    </span>
                                ),
                            }
                        ),
                        table: intl.formatMessage(
                            {
                                id: `schemaMode.options.${choice}.example.table`,
                            },
                            {
                                tablePrefix: (
                                    <span
                                        className={highlightClass}
                                    >{`${tablePrefix}_`}</span>
                                ),
                            }
                        ),
                    },
                    publicExample,
                    label: intl.formatMessage({
                        id: `schemaMode.options.${choice}.label`,
                    }),
                    val: choice,
                };
            }),
        [intl, publicTablePrefix, tablePrefix]
    );
}

export default useTargetSchemaOptions;
