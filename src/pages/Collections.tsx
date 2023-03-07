import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    SxProps,
    Theme,
    Toolbar,
} from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import NewCollection from 'components/collection/NewCollection';
import PageContainer from 'components/shared/PageContainer';
import CollectionsTable from 'components/tables/Collections';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { Plus } from 'iconoir-react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

const Collections = () => {
    useBrowserTitle('browserTitle.collections');

    // TODO: Maybe we really do want this to be a separate page?
    const [newCollectionIsOpen, setNewCollectionIsOpen] = useState(false);
    // There is _probably_ a better way to do this, but the idea is
    // to reset the state of the NewCollection component every time
    // it's closed, so you don't reopen it and have your previous
    // selections still selected, which would be unexpected.
    const [newCollectionKey, setNewCollectionKey] = useState(0);

    return (
        <PageContainer
            pageTitleProps={{
                header: authenticatedRoutes.collections.title,
                headerLink: 'https://docs.estuary.dev/concepts/#collections',
            }}
        >
            <Dialog
                open={newCollectionIsOpen}
                fullWidth
                maxWidth="md"
                onClose={() => {
                    setNewCollectionIsOpen(false);
                    setNewCollectionKey((k) => k + 1);
                }}
                // We want to keep the NewCollection mounted because that will allow it to
                // prefetch the list of collections, so we can avoid showing a loading spinner
                // in the 99% of the cases where a user waits a second or two before clicking
                // on the "new collection" button
                keepMounted
            >
                <DialogTitle>Build a new collection</DialogTitle>
                <DialogContent>
                    <NewCollection key={newCollectionKey} />
                </DialogContent>
            </Dialog>
            <Toolbar
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                <Button
                    size="large"
                    startIcon={<Plus style={{ fontSize: 14 }} />}
                    onClick={() => setNewCollectionIsOpen(true)}
                >
                    <FormattedMessage id="collectionsTable.cta.new" />
                </Button>
            </Toolbar>
            <Box sx={boxStyling}>
                <CollectionsTable />
            </Box>
        </PageContainer>
    );
};

export default Collections;
