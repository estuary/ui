import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    useTheme,
} from '@mui/material';
import { Cancel } from 'iconoir-react';
import { Dispatch, SetStateAction } from 'react';
import { FormattedMessage } from 'react-intl';
import StorageMappingsForm from './Form';
import SaveButton from './SaveButton';

interface Props {
    headerId: string;
    open: boolean;
    selectedTenant: string;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const TITLE_ID = 'configure-storage-dialog-title';

function ConfigureStorageDialog({
    headerId,
    open,
    selectedTenant,
    setOpen,
}: Props) {
    const theme = useTheme();

    const closeDialog = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setOpen(false);
    };

    return (
        <Dialog open={open} maxWidth="md" fullWidth aria-labelledby={TITLE_ID}>
            <DialogTitle
                component="div"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Typography variant="h6">
                    <FormattedMessage id={headerId} />
                </Typography>

                <IconButton onClick={closeDialog}>
                    <Cancel
                        style={{
                            fontSize: '1rem',
                            color: theme.palette.text.primary,
                        }}
                    />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 1 }}>
                <Typography sx={{ mb: 2 }}>
                    <FormattedMessage
                        id="storageMappings.dialog.generate.description"
                        values={{ tenant: <b>{selectedTenant}</b> }}
                    />
                </Typography>

                <StorageMappingsForm />
            </DialogContent>

            <DialogActions>
                <Button variant="outlined" size="small" onClick={closeDialog}>
                    <FormattedMessage id="cta.cancel" />
                </Button>

                <SaveButton disabled={false} setOpen={setOpen} />
            </DialogActions>
        </Dialog>
    );
}

export default ConfigureStorageDialog;
