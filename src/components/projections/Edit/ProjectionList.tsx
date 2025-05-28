import type { ProjectionListProps } from 'src/components/projections/Edit/types';

import { Box, Stack, Tooltip } from '@mui/material';

import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import { useUpdateDraftedProjection } from 'src/hooks/projections/useUpdateDraftedProjection';
import { logRocketConsole, logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
} from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { useWorkflowStore } from 'src/stores/Workflow/Store';
import { ExpandListChip } from 'src/styledComponents/chips/ExpandListChip';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';
import { useCollapsableList } from 'src/styledComponents/chips/useCollapsableList';
import { snackbarSettings } from 'src/utils/notification-utils';

export const ProjectionList = ({
    collection,
    editable,
    maxChips,
    projectedFields,
}: ProjectionListProps) => {
    const intl = useIntl();

    const { enqueueSnackbar } = useSnackbar();

    const { hiddenCount, list, listScroller, showEntireList } =
        useCollapsableList(projectedFields, maxChips);

    const { removeSingleProjection } = useUpdateDraftedProjection();
    const removeSingleStoredProjection = useWorkflowStore(
        (state) => state.removeSingleProjection
    );

    const formActive = useFormStateStore_isActive();
    const setFormState = useFormStateStore_setFormState();

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
                                    ? intl.formatMessage({
                                          id: 'projection.tooltip.systemDefinedField',
                                      })
                                    : ''
                            }
                        >
                            <OutlinedChip
                                diminishedText={Boolean(
                                    metadata?.systemDefined && list.length > 1
                                )}
                                disabled={formActive}
                                label={metadata.field}
                                onDelete={
                                    editable && !metadata?.systemDefined
                                        ? async () => {
                                              setFormState({
                                                  status: FormStatus.UPDATING,
                                              });

                                              removeSingleProjection(
                                                  collection,
                                                  metadata.field
                                              ).then(
                                                  () => {
                                                      removeSingleStoredProjection(
                                                          metadata,
                                                          collection
                                                      );

                                                      setFormState({
                                                          status: FormStatus.UPDATED,
                                                      });

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
                                                          { metadata }
                                                      );
                                                  },
                                                  (error) => {
                                                      setFormState({
                                                          status: FormStatus.FAILED,
                                                      });

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
                                                              error,
                                                              metadata,
                                                          }
                                                      );

                                                      enqueueSnackbar(
                                                          intl.formatMessage({
                                                              id: 'projection.error.alert.removalFailure',
                                                          }),
                                                          {
                                                              ...snackbarSettings,
                                                              variant: 'error',
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
