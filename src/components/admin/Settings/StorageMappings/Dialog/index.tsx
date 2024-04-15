import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    useTheme,
} from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import Error from 'components/shared/Error';
import { Cancel } from 'iconoir-react';
import { isEmpty } from 'lodash';
import { Dispatch, SetStateAction, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { JsonFormsData } from 'types';
import { hasLength } from 'utils/misc-utils';
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

    const [formData, setFormData] = useState<JsonFormsData>({
        data: {},
    });

    const [saving, setSaving] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const closeDialog = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setOpen(false);
        setFormData({ data: {} });
        setSaving(false);
        setServerError(null);
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
                {serverError ? (
                    <Box sx={{ mb: 2 }}>
                        <Error severity="error" error={serverError} condensed />
                    </Box>
                ) : null}

                <Typography sx={{ mb: 2 }}>
                    <FormattedMessage
                        id="storageMappings.dialog.generate.description"
                        values={{ tenant: <b>{selectedTenant}</b> }}
                    />
                </Typography>

                <Box sx={{ pt: 1, mb: 2 }}>
                    <AlertBox severity="info" short>
                        <FormattedMessage
                            id="storageMappings.dialog.generate.alert.keyPrefix"
                            values={{ tenant: <b>{selectedTenant}</b> }}
                        />
                    </AlertBox>
                </Box>

                <StorageMappingsForm
                    formData={formData}
                    setFormData={setFormData}
                />
            </DialogContent>

            <DialogActions>
                <Button variant="outlined" size="small" onClick={closeDialog}>
                    <FormattedMessage id="cta.cancel" />
                </Button>

                <SaveButton
                    disabled={
                        isEmpty(formData.data) || hasLength(formData.errors)
                    }
                    formData={formData.data}
                    prefix={selectedTenant}
                    saving={saving}
                    setOpen={setOpen}
                    setSaving={setSaving}
                    setServerError={setServerError}
                />
            </DialogActions>
        </Dialog>
    );
}

export default ConfigureStorageDialog;
