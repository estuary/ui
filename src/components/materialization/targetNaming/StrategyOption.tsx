import type { AutoCompleteOptionForTargetSchemaExample } from 'src/components/materialization/targetNaming/types';
import type { BaseComponentProps, TargetNamingStrategy } from 'src/types';

import { Box, FormControlLabel, Radio, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import { ExampleRow } from 'src/components/materialization/targetNaming/ExampleRow';
import StrategyOptionWrapper from 'src/components/materialization/targetNaming/StrategyOptionWrapper';
import PreformattedBlock from 'src/components/shared/PreformattedBlock';

export type StrategyKey = TargetNamingStrategy['strategy'];

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
        <StrategyOptionWrapper
            onClick={selected || readOnly ? undefined : onSelect}
            selected={selected}
            readOnly={readOnly}
        >
            {readOnly ? (
                <Typography sx={{ mb: 0.5, fontWeight: 500 }}>
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
                            'cursor': 'default',
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
                                <Stack sx={{ pl: 0.5 }} spacing={1}>
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
        </StrategyOptionWrapper>
    );
}
