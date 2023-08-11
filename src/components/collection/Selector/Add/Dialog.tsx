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

interface Props {
    id: string;
    open: boolean;
    title: string | ReactNode;
    toggle: (args: any) => void;
    primaryCTA: any;
}

function AddCollectionDialog({ id, primaryCTA, open, title, toggle }: Props) {
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
                            <BindingSelectorTable />
                        </Box>
                    </StepWrapper>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button variant="outlined" onClick={() => toggle(false)}>
                    <FormattedMessage id="cta.cancel" />
                </Button>

                {primaryCTA}
            </DialogActions>
        </Dialog>
    );
}

export default AddCollectionDialog;
