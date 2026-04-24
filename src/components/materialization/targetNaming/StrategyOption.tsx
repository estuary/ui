import type { TargetNamingStrategy } from 'src/types';

import { Box, FormControlLabel, Radio, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

export type StrategyKey = TargetNamingStrategy['strategy'];

export interface StrategyOptionProps {
    value: StrategyKey;
    selected: boolean;
    onSelect: () => void;
}

export function StrategyOption({
    value,
    selected,
    onSelect,
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
                <Typography variant="body2" color="text.secondary">
                    {intl.formatMessage({
                        id: `destinationLayout.strategy.${value}.description`,
                    })}
                </Typography>
            </Box>
        </Box>
    );
}
