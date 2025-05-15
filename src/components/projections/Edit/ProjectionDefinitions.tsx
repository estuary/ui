import type { ProjectionDefinitionsProps } from 'src/components/projections/Edit/types';

import { Box, Chip, Stack } from '@mui/material';

import { defaultOutline } from 'src/context/Theme';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

export const ProjectionDefinitions = ({
    collection,
    projectedFields,
}: ProjectionDefinitionsProps) => {
    const removeSingleProjection = useWorkflowStore(
        (state) => state.removeSingleProjection
    );

    if (!collection) {
        return null;
    }

    return (
        <Stack spacing={1}>
            {projectedFields.map((metadata, index) => (
                <Box
                    key={`projection-${metadata.field}-${index}`}
                    style={{ alignItems: 'center', display: 'inline-flex' }}
                >
                    <Chip
                        component="span"
                        label={metadata.field}
                        onDelete={() =>
                            removeSingleProjection(metadata, collection)
                        }
                        size="small"
                        sx={{
                            'border': (theme) =>
                                defaultOutline[theme.palette.mode],
                            '&:hover': {
                                background: (theme) =>
                                    theme.palette.background.default,
                            },
                            '&:hover::after': {
                                background: (theme) =>
                                    theme.palette.background.default,
                            },
                            '& .MuiChip-deleteIconSmall': {
                                'mr': '1px',
                                '&:hover': {
                                    color: (theme) => theme.palette.error.main,
                                },
                            },
                        }}
                        variant="outlined"
                    />
                </Box>
            ))}
        </Stack>
    );
};
