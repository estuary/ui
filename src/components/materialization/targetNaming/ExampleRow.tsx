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
        id: 'destinationLayout.example.table.label',
    });
    const schemaLabel = intl.formatMessage({
        id: 'destinationLayout.example.schema.label',
    });

    return (
        <Box
            component="span"
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
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
                useFlexGap
                direction={outputLayout === 'column' ? 'column' : 'row'}
                spacing={0.5}
                sx={{ flexWrap: 'wrap', overflow: 'auto' }}
            >
                <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                    <Box sx={{ whiteSpace: 'nowrap' }}>{schemaLabel}</Box>
                    <code style={{ wordBreak: 'break-all' }}>
                        <b>{example.schema}</b>
                    </code>
                </Stack>
                <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                    <Box sx={{ whiteSpace: 'nowrap' }}>{tableLabel}</Box>
                    <code style={{ wordBreak: 'break-all' }}>
                        <b>{example.table}</b>
                    </code>
                </Stack>
            </Stack>
        </Box>
    );
}
