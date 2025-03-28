import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
} from '@mui/material';

import DefaultCancelButton from './DefaultCancelButton';
import { AddDialogProps } from './types';

import BindingSelectorTable from 'src/components/collection/Selector/Table';
import StepWrapper from 'src/components/transformation/create/Wrapper';

function AddDialog({
    entity,
    id,
    PrimaryCTA,
    SecondaryCTA,
    open,
    selectedCollections,
    title,
    toggle,
    OptionalSettings,
}: AddDialogProps) {
    const CancelButton = SecondaryCTA ?? DefaultCancelButton;

    return (
        <Dialog id={id} open={open} fullWidth maxWidth="xl">
            <DialogTitle>{title}</DialogTitle>

            <DialogContent>
                <Stack spacing={3} sx={{ pt: 2 }}>
                    <StepWrapper>
                        <Box>
                            {open ? (
                                <BindingSelectorTable
                                    disableQueryParamHack
                                    entity={entity}
                                    selectedCollections={selectedCollections}
                                />
                            ) : null}
                        </Box>
                    </StepWrapper>

                    {OptionalSettings ? <OptionalSettings /> : null}
                </Stack>
            </DialogContent>

            <DialogActions>
                <CancelButton toggle={toggle} />
                <PrimaryCTA toggle={toggle} />
            </DialogActions>
        </Dialog>
    );
}

export default AddDialog;
