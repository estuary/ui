import type { AutoCompleteOptionForTargetSchemaExample } from 'src/components/materialization/source/targetSchema/types';
import type { BaseComponentProps, TargetNamingStrategy } from 'src/types';

import { Box, FormControlLabel, Radio, Stack, Typography } from '@mui/material';

import { ArrowRight } from 'iconoir-react';
import { useIntl } from 'react-intl';

import PreformattedBlock from 'src/components/shared/PreformattedBlock';

export type StrategyKey = TargetNamingStrategy['strategy'];

function ExampleRow({
    example,
}: {
    example: AutoCompleteOptionForTargetSchemaExample;
}) {
    const intl = useIntl();
    return (
        <Stack
            component="span"
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ fontSize: 12 }}
        >
            <code>
                {example.sourceName ?? (
                    <>
                        acmeco/<b>{example.tablePrefix}</b>/orders
                    </>
                )}
            </code>
            <ArrowRight width={14} height={14} />
            <span>
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
            </span>
        </Stack>
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
                border: (theme) =>
                    `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
                borderRadius: 1,
                cursor: readOnly ? 'default' : 'pointer',
                p: 1.5,
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
            </Box>

            {selected && example ? (
                <PreformattedBlock>
                    <Stack spacing={0.5}>
                        <Typography>
                            {intl.formatMessage({ id: 'common.examples' })}
                        </Typography>

                        <ExampleRow example={example} />
                        {publicExample ? (
                            <ExampleRow example={publicExample} />
                        ) : null}
                    </Stack>
                </PreformattedBlock>
            ) : null}
        </Box>
    );
}
