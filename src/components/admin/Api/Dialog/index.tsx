import {
    Dialog,
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

import SingleLineCode from 'components/content/SingleLineCode';
import AlertBox from 'components/shared/AlertBox';
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

    const token = useRefreshTokenStore((state) => state.token);

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
                    <FormattedMessage id="admin.cli_api.refreshToken.dialog.header" />
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
                <Grid
                    container
                    spacing={3}
                    sx={{ mb: 5, alignItems: 'flex-start' }}
                >
                    {serverError ? (
                        <Grid item xs={12}>
                            <Error
                                severity="error"
                                error={serverError}
                                condensed
                            />
                        </Grid>
                    ) : null}

                    {token ? (
                        <Grid item xs={12}>
                            <AlertBox severity="info" short>
                                <Typography sx={{ mb: 1 }}>
                                    <FormattedMessage id="admin.cli_api.refreshToken.dialog.alert.copyToken" />
                                </Typography>

                                <SingleLineCode value={token} />
                            </AlertBox>
                        </Grid>
                    ) : null}

                    <Grid item xs={9} sx={{ mt: 1, display: 'flex' }}>
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

                    <Grid item xs={3} sx={{ mt: 1, display: 'flex' }}>
                        <GenerateButton />
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
}

export default CreateRefreshTokenDialog;
