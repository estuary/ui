import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
} from '@mui/material';
import BindingSelectorTable from 'components/collection/Selector/Table';
import SingleStep from 'components/transformation/create/SingleStep';
import StepWrapper from 'components/transformation/create/Wrapper';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { AddCollectionDialogCTAProps } from './types';

interface Props extends AddCollectionDialogCTAProps {
    id: string;
    open: boolean;
    primaryCTA: any;
    selectedCollections: string[];
    title: string | ReactNode;
}

function AddCollectionDialog({
    id,
    primaryCTA,
    open,
    selectedCollections,
    title,
    toggle,
}: Props) {
    const ContinueButton = primaryCTA;

    return (
        <Dialog id={id} open={open} fullWidth maxWidth="md">
            <DialogTitle>{title}</DialogTitle>

            <DialogContent>
                <Stack spacing={3} sx={{ pt: 2 }}>
                    <StepWrapper>
                        <SingleStep>
                            <FormattedMessage id="newTransform.baseConfig.sourceCollections.label" />
                        </SingleStep>

                        <Divider />

                        <Box>
                            <BindingSelectorTable
                                selectedCollections={selectedCollections}
                            />
                        </Box>
                    </StepWrapper>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button variant="outlined" onClick={() => toggle(false)}>
                    <FormattedMessage id="cta.cancel" />
                </Button>

                <ContinueButton toggle={toggle} />
            </DialogActions>
        </Dialog>
    );
}

export default AddCollectionDialog;
