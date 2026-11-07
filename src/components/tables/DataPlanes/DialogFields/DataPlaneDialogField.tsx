import { Stack, Typography } from '@mui/material';

import { useSemanticLeaf } from 'react-semantic-tree';

import SingleLineCode from 'src/components/content/SingleLineCode';

interface DataPlaneDialogFieldProps {
    label: string;
    value: string | null;
    showCopyButton?: boolean;
}

export function DataPlaneDialogField({
    label,
    value,
    showCopyButton = true,
}: DataPlaneDialogFieldProps) {
    const { ref: semanticCopyDataPlaneFieldRef } =
        useSemanticLeaf<HTMLButtonElement>('Copy Data Plane Field');

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
                <SingleLineCode
                    copyButtonRef={semanticCopyDataPlaneFieldRef}
                    value={value ?? '-'}
                />
            ) : (
                <Typography color="text.secondary">{value ?? '-'}</Typography>
            )}
        </Stack>
    );
}
