import type { ProjectionListProps } from 'src/components/projections/Edit/types';

import { Box, Stack } from '@mui/material';

import { useUpdateDraftedProjection } from 'src/hooks/projections/useUpdateDraftedProjection';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useWorkflowStore } from 'src/stores/Workflow/Store';
import { ExpandListChip } from 'src/styledComponents/chips/ExpandListChip';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';
import { useCollapsableList } from 'src/styledComponents/chips/useCollapsableList';

export const ProjectionList = ({
    collection,
    diminishedText,
    editable,
    maxChips,
    projectedFields,
}: ProjectionListProps) => {
    const { hiddenCount, list, listScroller, showEntireList } =
        useCollapsableList(projectedFields, maxChips);

    const { removeSingleProjection } = useUpdateDraftedProjection();
    const removeSingleStoredProjection = useWorkflowStore(
        (state) => state.removeSingleProjection
    );

    if (!collection) {
        return null;
    }

    return (
        <Stack>
            <Stack spacing={1} ref={listScroller}>
                {list.map((metadata, index) => (
                    <Box
                        key={`projection-${metadata.field}-${index}`}
                        style={{ alignItems: 'center', display: 'inline-flex' }}
                    >
                        <OutlinedChip
                            label={metadata.field}
                            diminishedText={
                                diminishedText ? index > 0 : undefined
                            }
                            onDelete={
                                editable
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

                                                  logRocketEvent(
                                                      CustomEvents.PROJECTION,
                                                      {
                                                          collection,
                                                          metadata,
                                                          operation: 'remove',
                                                      }
                                                  );
                                              },
                                              (error) => {
                                                  logRocketEvent(
                                                      CustomEvents.PROJECTION,
                                                      {
                                                          collection,
                                                          error,
                                                          metadata,
                                                          operation: 'remove',
                                                      }
                                                  );
                                              }
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

            <Box
                style={{
                    alignItems: 'center',
                    display: 'inline-flex',
                    marginTop: hiddenCount > 0 ? 8 : undefined,
                }}
            >
                <ExpandListChip
                    hiddenCount={hiddenCount}
                    showEntireList={showEntireList}
                />
            </Box>
        </Stack>
    );
};
