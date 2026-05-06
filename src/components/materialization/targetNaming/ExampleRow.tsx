import type { ReactNode } from 'react';
import type { AutoCompleteOptionForTargetSchemaExample } from 'src/components/materialization/targetNaming/types';

import { Box, Stack } from '@mui/material';

import { ArrowRight } from 'iconoir-react';
import { useIntl } from 'react-intl';

import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import { splitAroundToken } from 'src/components/materialization/targetNaming/shared';

type Props =
    | {
          example: AutoCompleteOptionForTargetSchemaExample;
          hideSourceName?: false;
          outputLayout?: 'row' | 'column';
      }
    | {
          example: Omit<
              AutoCompleteOptionForTargetSchemaExample,
              'tablePrefix'
          > & {
              tablePrefix?: string;
          };
          hideSourceName: true;
          outputLayout?: 'row' | 'column';
      };

function ChipLabel({
    value,
    source,
}: {
    value: string | ReactNode;
    source: string | undefined;
}) {
    const split =
        typeof value === 'string' && source
            ? splitAroundToken(value, source)
            : null;
    const parts =
        split && (split.prefix || split.suffix)
            ? { ...split, middle: source as string }
            : null;
    if (!parts) {
        return <>{value}</>;
    }

    return (
        <>
            <Box
                component="span"
                sx={{ color: 'primary.main', fontWeight: 700 }}
            >
                {parts.prefix}
            </Box>
            <Box component="span" sx={{ opacity: 0.8 }}>
                {parts.middle}
            </Box>
            <Box
                component="span"
                sx={{ color: 'primary.main', fontWeight: 700 }}
            >
                {parts.suffix}
            </Box>
        </>
    );
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
                <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    sx={{ flexShrink: 0 }}
                >
                    <Box sx={{ whiteSpace: 'nowrap' }}>{schemaLabel}</Box>
                    <TechnicalEmphasis enableBackground>
                        <ChipLabel
                            value={example.schema}
                            source={example.sourceSchema}
                        />
                    </TechnicalEmphasis>
                </Stack>
                <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    sx={{ flexShrink: 0 }}
                >
                    <Box sx={{ whiteSpace: 'nowrap' }}>{tableLabel}</Box>
                    <TechnicalEmphasis enableBackground>
                        <ChipLabel
                            value={example.table}
                            source={example.sourceTable}
                        />
                    </TechnicalEmphasis>
                </Stack>
            </Stack>
        </Box>
    );
}
