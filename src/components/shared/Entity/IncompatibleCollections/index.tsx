import { Box, Collapse, Divider, Stack, Typography } from '@mui/material';

import { useBindingsEditorStore_incompatibleCollections } from 'src/components/editor/Bindings/Store/hooks';
import AlertBox from 'src/components/shared/AlertBox';
import Actions from 'src/components/shared/Entity/IncompatibleCollections/Actions';
import CollectionsList from 'src/components/shared/Entity/IncompatibleCollections/CollectionsList';
import { hasLength } from 'src/utils/misc-utils';

function IncompatibleCollections() {
    const incompatibleCollections =
        useBindingsEditorStore_incompatibleCollections();
    const hasIncompatibleCollections = hasLength(incompatibleCollections);

    return (
        <Collapse
            in={hasIncompatibleCollections}
            sx={{
                mb: 2,
            }}
            unmountOnExit
        >
            <AlertBox
                short
                severity="warning"
                title={
                    <Typography
                        component="span"
                        sx={{ fontSize: 18, fontWeight: 500 }}
                    >
                        Changes rejected due to incompatible collection updates
                    </Typography>
                }
            >
                <Stack spacing={1}>
                    <Divider flexItem />

                    <Box>
                        <Typography>
                            {
                                "Click 'Apply' below to accept changes which will automatically re-version and backfill your collections."
                            }
                        </Typography>

                        <Typography variant="subtitle2">
                            Note: This may result in additional costs as
                            collections are backfilled.
                        </Typography>
                    </Box>

                    <CollectionsList />
                    <Actions />
                </Stack>
            </AlertBox>
        </Collapse>
    );
}

export default IncompatibleCollections;
