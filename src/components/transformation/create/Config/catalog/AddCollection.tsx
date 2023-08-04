import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
} from '@mui/material';
import { BindingsSelectorSkeleton } from 'components/collection/CollectionSkeletons';
import CollectionSelector from 'components/collection/Selector';
import UpdateDraftButton from 'components/transformation/create/Config/UpdateDraftButton';
import SingleStep from 'components/transformation/create/SingleStep';
import StepWrapper from 'components/transformation/create/Wrapper';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { Actions } from 'react-use/lib/useSet';

interface Props {
    collections: Set<string>;
    collectionsActions: Actions<string>;
    open: boolean;
    title: string | ReactNode;
    toggle: (args: any) => void;
}

function AddCollection({
    collections,
    collectionsActions,
    open,
    title,
    toggle,
}: Props) {
    return (
        <Dialog open={open} fullWidth maxWidth="md">
            <DialogTitle>{title}</DialogTitle>

            <DialogContent>
                <Stack spacing={3} sx={{ pt: 2 }}>
                    <StepWrapper>
                        <SingleStep>
                            <FormattedMessage id="newTransform.baseConfig.sourceCollections.label" />
                        </SingleStep>

                        <Divider />

                        <CollectionSelector
                            height={350}
                            loading={false}
                            skeleton={<BindingsSelectorSkeleton />}
                            removeAllCollections={collectionsActions.reset}
                        />
                    </StepWrapper>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button variant="outlined" onClick={toggle}>
                    <FormattedMessage id="cta.cancel" />
                </Button>

                <UpdateDraftButton setDialogOpen={toggle} />
            </DialogActions>
        </Dialog>
    );
}

export default AddCollection;
