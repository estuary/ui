import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import Error from 'components/shared/Error';
import { Cancel } from 'iconoir-react';
import { Dispatch, SetStateAction } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { useRefreshTokenStore } from '../Store/create';
import GenerateButton from './GenerateButton';

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const TITLE_ID = 'create-refresh-tokens-title';

function CreateRefreshTokenDialog({ open, setOpen }: Props) {
    const theme = useTheme();
    const intl = useIntl();

    const description = useRefreshTokenStore((state) => state.description);
    const updateDescription = useRefreshTokenStore(
        (state) => state.updateDescription
    );

    const saving = useRefreshTokenStore((state) => state.saving);
    const serverError = useRefreshTokenStore((state) => state.serverError);

    const resetState = useRefreshTokenStore((state) => state.resetState);

    const closeDialog = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setOpen(false);
        resetState();
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
                    <FormattedMessage id="storageMappings.configureStorage.label" />
                </Typography>

                <IconButton disabled={saving} onClick={closeDialog}>
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

                <Typography sx={{ mb: 3 }}>
                    <FormattedMessage id="storageMappings.dialog.generate.description" />
                </Typography>

                <Grid
                    container
                    spacing={2}
                    sx={{ mb: 5, pt: 1, alignItems: 'flex-start' }}
                >
                    <Grid item xs={9} sx={{ display: 'flex' }}>
                        <TextField
                            InputProps={{
                                sx: { borderRadius: 3 },
                            }}
                            // error={inputErrorExists}
                            label={intl.formatMessage({
                                id: 'data.description',
                            })}
                            onChange={(event) =>
                                updateDescription(event.target.value)
                            }
                            required
                            size="small"
                            sx={{ flexGrow: 1 }}
                            value={description}
                            variant="outlined"
                        />
                    </Grid>

                    <Grid item xs={3} sx={{ display: 'flex' }}>
                        <GenerateButton />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button
                    disabled={saving}
                    variant="outlined"
                    size="small"
                    onClick={closeDialog}
                >
                    <FormattedMessage id="cta.cancel" />
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default CreateRefreshTokenDialog;
