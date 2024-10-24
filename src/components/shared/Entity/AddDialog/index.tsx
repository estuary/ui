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
import { FormattedMessage } from 'react-intl';
import OptionalSettings from './OptionalSettings';
import { AddDialogProps } from './types';

function AddDialog({
    entity,
    id,
    primaryCTA,
    open,
    selectedCollections,
    title,
    toggle,
}: AddDialogProps) {
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
                                    disableQueryParamHack
                                    entity={entity}
                                    selectedCollections={selectedCollections}
                                />
                            ) : null}
                        </Box>
                    </StepWrapper>
                    <OptionalSettings />
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button
                    variant="outlined"
                    onClick={() => {
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
