import { Box, Button } from '@mui/material';

import { LIFETIME_OPTIONS } from 'src/components/admin/ServiceAccounts/shared';

interface LifetimeSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

// Row of selectable lifetime pills for an API key's `validFor`.
export function LifetimeSelector({ value, onChange }: LifetimeSelectorProps) {
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {LIFETIME_OPTIONS.map((option) => (
                <Button
                    key={option.value}
                    size="small"
                    variant={value === option.value ? 'contained' : 'outlined'}
                    onClick={() => onChange(option.value)}
                    sx={{ borderRadius: (theme) => theme.radius.full }}
                >
                    {option.label}
                </Button>
            ))}
        </Box>
    );
}
