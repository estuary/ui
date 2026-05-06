import type { AutoCompleteOptionForTargetSchemaExample } from 'src/components/materialization/targetNaming/types';

import { Box, Stack } from '@mui/material';

import { ArrowRight } from 'iconoir-react';
import { useIntl } from 'react-intl';

interface Props {
    example: AutoCompleteOptionForTargetSchemaExample;
    hideSourceName?: boolean;
    outputLayout?: 'row' | 'column';
}

export function ExampleRow({
    example,
    hideSourceName,
    outputLayout = 'row',
}: Props) {
    const intl = useIntl();

    const tableLabel = intl.formatMessage({
        id: 'destinationLayout.dialog.table.label',
    });
    const schemaLabel = intl.formatMessage({
        id: 'destinationLayout.dialog.schema.label',
    });

    return (
        <Box
            component="span"
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 1,
                fontSize: 12,
                wordBreak: 'break-all',
            }}
        >
            {hideSourceName ? null : (
                <>
                    <code>
                        {example.sourceName ?? (
                            <>
                                {intl.formatMessage({ id: 'defaults.tenant' })}/
                                <b>{example.tablePrefix}</b>/
                                {example.sourceTable ??
                                    intl.formatMessage({
                                        id: 'defaults.table',
                                    })}
                            </>
                        )}
                    </code>
                    <ArrowRight width={14} height={14} />
                </>
            )}
            <Stack
                direction={outputLayout === 'column' ? 'column' : 'row'}
                spacing={outputLayout === 'column' ? 0.5 : undefined}
                sx={
                    outputLayout === 'row'
                        ? { maxHeight: 100, overflow: 'auto' }
                        : undefined
                }
            >
                <span>
                    {schemaLabel}
                    {': '}
                    <code>
                        <b>{example.schema}</b>
                    </code>
                </span>
                {outputLayout === 'row' ? <span>{' | '}</span> : null}
                <span>
                    {tableLabel}
                    {': '}
                    <code>
                        <b>{example.table}</b>
                    </code>
                </span>
            </Stack>
        </Box>
    );
}
