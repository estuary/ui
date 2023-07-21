import { FormattedMessage } from 'react-intl';

import { Box, Collapse, Stack, Typography } from '@mui/material';

import { useBindingsEditorStore_incompatibleCollections } from 'components/editor/Bindings/Store/hooks';
import AlertBox from 'components/shared/AlertBox';

import { hasLength } from 'utils/misc-utils';

import Actions from './Actions';
import CollectionsList from './CollectionsList';

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
                    <Typography variant="h5" component="span">
                        <FormattedMessage id="entityEvolution.error.title" />
                    </Typography>
                }
            >
                <Stack spacing={2}>
                    <Box>
                        <Typography>
                            <FormattedMessage id="entityEvolution.error.message" />
                        </Typography>

                        <Typography variant="subtitle2">
                            <FormattedMessage id="entityEvolution.error.note" />
                        </Typography>
                    </Box>

                    <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                        <CollectionsList />
                    </Box>
                    <Actions />
                </Stack>
            </AlertBox>
        </Collapse>
    );
}

export default IncompatibleCollections;
