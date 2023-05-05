import { Box, Collapse, Stack, Typography } from '@mui/material';
import { useBindingsEditorStore_hasInvalidSchemaCollections } from 'components/editor/Bindings/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import { FormattedMessage } from 'react-intl';
import Actions from './Actions';
import CollectionsList from './CollectionsList';

function IncompatibleSchema() {
    const hasInvalidSchemas =
        useBindingsEditorStore_hasInvalidSchemaCollections();

    return (
        <Collapse
            in={hasInvalidSchemas}
            sx={{
                mb: 2,
            }}
            unmountOnExit
        >
            <AlertBox
                short
                severity="error"
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

                    <CollectionsList />

                    <Actions />
                </Stack>
            </AlertBox>
        </Collapse>
    );
}

export default IncompatibleSchema;
