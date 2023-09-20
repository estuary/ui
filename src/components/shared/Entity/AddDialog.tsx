import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
} from '@mui/material';
import BindingSelectorTable from 'components/collection/Selector/Table';
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

function AddDialog({
    entity,
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
                        <Box>
                            {open ? (
                                <BindingSelectorTable
                                    entity={entity}
                                    selectedCollections={selectedCollections}
                                />
                            ) : null}
                        </Box>
                    </StepWrapper>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button
                    variant="outlined"
                    onClick={() => {
                        console.log('toggling closed');
                        toggle(false);
                    }}
                >
                    <FormattedMessage id="cta.cancel" />
                </Button>

                <ContinueButton toggle={toggle} />
            </DialogActions>
        </Dialog>
    );
}

export default AddDialog;
