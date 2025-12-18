import type { DataPlaneDialogFieldProps } from 'src/components/tables/DataPlanes/types';

import { Stack, Typography } from '@mui/material';

import SingleLineCode from 'src/components/content/SingleLineCode';

export function DataPlaneDialogField({
    label,
    value,
    showCopyButton = true,
}: DataPlaneDialogFieldProps) {
    return (
        <Stack
            sx={{
                py: 1,
            }}
        >
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                {label}
            </Typography>
            {showCopyButton ? (
                <SingleLineCode value={value ?? '-'} />
            ) : (
                <Typography color="text.secondary">{value ?? '-'}</Typography>
            )}
        </Stack>
    );
}
