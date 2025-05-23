import type { ProjectionListProps } from 'src/components/projections/Edit/types';

import { Box, Stack, Tooltip } from '@mui/material';

import { useUpdateDraftedProjection } from 'src/hooks/projections/useUpdateDraftedProjection';
import { logRocketConsole, logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useWorkflowStore } from 'src/stores/Workflow/Store';
import { ExpandListChip } from 'src/styledComponents/chips/ExpandListChip';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';
import { useCollapsableList } from 'src/styledComponents/chips/useCollapsableList';

export const ProjectionList = ({
    collection,
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
                        <Tooltip
                            placement="bottom-start"
                            title={
                                metadata?.systemDefined
                                    ? 'The system-defined alias for this location.'
                                    : ''
                            }
                        >
                            <OutlinedChip
                                diminishedText={Boolean(
                                    metadata?.systemDefined && list.length > 1
                                )}
                                label={metadata.field}
                                onDelete={
                                    editable && !metadata?.systemDefined
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
                                                              operation:
                                                                  'remove',
                                                          }
                                                      );
                                                      logRocketConsole(
                                                          `${CustomEvents.PROJECTION}:remove:success`,
                                                          {
                                                              collection,
                                                              metadata,
                                                              operation:
                                                                  'remove',
                                                          }
                                                      );
                                                  },
                                                  (error) => {
                                                      logRocketEvent(
                                                          CustomEvents.PROJECTION,
                                                          {
                                                              collection,
                                                              error: true,
                                                              operation:
                                                                  'remove',
                                                          }
                                                      );
                                                      logRocketConsole(
                                                          `${CustomEvents.PROJECTION}:remove:failed`,
                                                          {
                                                              collection,
                                                              error,
                                                              metadata,
                                                              operation:
                                                                  'remove',
                                                          }
                                                      );
                                                  }
                                              );
                                          }
                                        : undefined
                                }
                                size="small"
                                sx={
                                    metadata?.systemDefined
                                        ? { fontFamily: 'monospace' }
                                        : undefined
                                }
                                variant="outlined"
                            />
                        </Tooltip>
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
