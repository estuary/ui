import type { AutoCompleteOptionForTargetSchemaExample } from 'src/components/materialization/source/targetSchema/types';
import type { TargetNamingStrategy } from 'src/types';

import { Box, FormControlLabel, Radio, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import OptionExample from 'src/components/materialization/source/targetSchema/OptionExample';
import PreformattedBlock from 'src/components/shared/PreformattedBlock';

export type StrategyKey = TargetNamingStrategy['strategy'];

export interface StrategyOptionProps {
    value: StrategyKey;
    selected: boolean;
    onSelect: () => void;
    example: AutoCompleteOptionForTargetSchemaExample;
    publicExample: AutoCompleteOptionForTargetSchemaExample;
    children?: React.ReactNode;
}

export function StrategyOption({
    value,
    selected,
    onSelect,
    example,
    publicExample,
    children,
}: StrategyOptionProps) {
    const intl = useIntl();
    return (
        <Box
            onClick={onSelect}
            sx={{
                border: (theme) =>
                    `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
                borderRadius: 1,
                cursor: 'pointer',
                p: 1.5,
            }}
        >
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
            <Box sx={{ pl: 4 }}>
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

                {selected ? (
                    <PreformattedBlock>
                        <Stack spacing={0.5}>
                            <Typography>
                                {intl.formatMessage({ id: 'common.examples' })}
                            </Typography>

                            <OptionExample
                                example={example}
                                baseTableMessageID="schemaMode.example.base"
                            />
                            {publicExample ? (
                                <OptionExample
                                    example={publicExample}
                                    baseTableMessageID="schemaMode.example.base"
                                />
                            ) : null}
                        </Stack>
                    </PreformattedBlock>
                ) : null}
            </Box>
        </Box>
    );
}
