import type { AutoCompleteOptionForTargetSchemaExample } from 'src/components/materialization/targetNaming/types';
import type { BaseComponentProps, TargetNamingStrategy } from 'src/types';

import { Box, FormControlLabel, Radio, Stack, Typography } from '@mui/material';

import { ArrowRight } from 'iconoir-react';
import { useIntl } from 'react-intl';

import PreformattedBlock from 'src/components/shared/PreformattedBlock';
import { defaultOutline, defaultOutline_hovered } from 'src/context/Theme';

export type StrategyKey = TargetNamingStrategy['strategy'];

function ExampleRow({
    example,
}: {
    example: AutoCompleteOptionForTargetSchemaExample;
}) {
    const intl = useIntl();

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
            <code>
                {example.sourceName ?? (
                    <>
                        {intl.formatMessage({ id: 'defaults.tenant' })}/
                        <b>{example.tablePrefix}</b>/
                        {example.sourceTable ??
                            intl.formatMessage({ id: 'defaults.table' })}
                    </>
                )}
            </code>
            <ArrowRight width={14} height={14} />
            <Box
                sx={{
                    maxHeight: 100,
                    overflow: 'auto',
                }}
            >
                {intl.formatMessage({
                    id: 'destinationLayout.dialog.table.label',
                })}
                {': '}
                <code>
                    <b>{example.table}</b>
                </code>
                {' | '}
                {intl.formatMessage({
                    id: 'destinationLayout.dialog.schema.label',
                })}
                {': '}
                <code>
                    <b>{example.schema}</b>
                </code>
            </Box>
        </Box>
    );
}

export interface StrategyOptionProps extends BaseComponentProps {
    value: StrategyKey;
    selected: boolean;
    onSelect?: () => void;
    example: AutoCompleteOptionForTargetSchemaExample | null;
    publicExample: AutoCompleteOptionForTargetSchemaExample | null;
    readOnly?: boolean;
}

export function StrategyOption({
    value,
    selected,
    onSelect,
    example,
    publicExample,
    children,
    readOnly,
}: StrategyOptionProps) {
    const intl = useIntl();
    return (
        <Box
            onClick={readOnly ? undefined : onSelect}
            sx={{
                'border': (theme) =>
                    selected
                        ? `1px solid ${theme.palette.primary.main}`
                        : defaultOutline[theme.palette.mode],
                'borderRadius': 1,
                'cursor': readOnly ? 'default' : 'pointer',
                'p': 1.5,
                '&:hover': readOnly
                    ? undefined
                    : {
                          border: (theme) =>
                              selected
                                  ? `1px solid ${theme.palette.primary.main}`
                                  : defaultOutline_hovered[theme.palette.mode],
                      },
            }}
        >
            {readOnly ? (
                <Typography fontWeight={500} sx={{ mb: 0.5 }}>
                    {intl.formatMessage({
                        id: `destinationLayout.strategy.${value}.label`,
                    })}
                </Typography>
            ) : (
                <FormControlLabel
                    value={value}
                    control={<Radio size="small" />}
                    label={
                        <Typography fontWeight={500}>
                            {intl.formatMessage({
                                id: `destinationLayout.strategy.${value}.label`,
                            })}
                        </Typography>
                    }
                    sx={{ mb: 0.5, pointerEvents: 'none' }}
                />
            )}
            <Box sx={{ pl: readOnly ? 0 : 4 }}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                >
                    {intl.formatMessage({
                        id: `destinationLayout.strategy.${value}.description`,
                    })}
                </Typography>

                {children}

                {selected && example ? (
                    <Box
                        sx={{
                            '& pre': { whiteSpace: 'pre-wrap' },
                        }}
                    >
                        <PreformattedBlock>
                            <Stack>
                                <Typography>
                                    {intl.formatMessage({
                                        id: 'common.examples',
                                    })}
                                </Typography>
                                <Stack sx={{ pl: 0.5 }}>
                                    <ExampleRow example={example} />
                                    {publicExample ? (
                                        <ExampleRow example={publicExample} />
                                    ) : null}
                                </Stack>
                            </Stack>
                        </PreformattedBlock>
                    </Box>
                ) : null}
            </Box>
        </Box>
    );
}
