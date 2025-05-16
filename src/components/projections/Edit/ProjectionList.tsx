import type { ProjectionListProps } from 'src/components/projections/Edit/types';

import { Box, Stack } from '@mui/material';

import { OutlinedChip } from 'src/components/shared/OutlinedChip';
import { useUpdateDraftedProjection } from 'src/hooks/projections/useUpdateDraftedProjection';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

export const ProjectionList = ({
    collection,
    deletable,
    diminishedText,
    projectedFields,
}: ProjectionListProps) => {
    const { removeSingleProjection } = useUpdateDraftedProjection();
    const removeSingleStoredProjection = useWorkflowStore(
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
                        diminishedText={diminishedText ? index > 0 : undefined}
                        onDelete={
                            deletable
                                ? () => {
                                      removeSingleProjection(
                                          collection,
                                          metadata.field
                                      ).then(
                                          () => {
                                              removeSingleStoredProjection(
                                                  metadata,
                                                  collection
                                              );
                                          },
                                          () => {}
                                      );
                                  }
                                : undefined
                        }
                        size="small"
                        variant="outlined"
                    />
                </Box>
            ))}
        </Stack>
    );
};
