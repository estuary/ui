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
import CollectionSearchAndSelector from 'components/collection/UnderDev_Selector';
import SingleStep from 'components/transformation/create/SingleStep';
import StepWrapper from 'components/transformation/create/Wrapper';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    open: boolean;
    title: string | ReactNode;
    toggle: (args: any) => void;
    primaryCTA: any;
}

function AddCollection({ primaryCTA, open, title, toggle }: Props) {
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

                        <Box>
                            <CollectionSearchAndSelector />
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

export default AddCollection;
