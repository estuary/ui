import type { ProjectionListProps } from 'src/components/projections/Edit/types';

import { Box, Stack } from '@mui/material';

import { OutlinedChip } from 'src/components/shared/OutlinedChip';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

export const ProjectionList = ({
    collection,
    projectedFields,
}: ProjectionListProps) => {
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
                    <OutlinedChip
                        label={metadata.field}
                        diminishedText={index > 0}
                        onDelete={() =>
                            removeSingleProjection(metadata, collection)
                        }
                        size="small"
                        variant="outlined"
                    />
                </Box>
            ))}
        </Stack>
    );
};
