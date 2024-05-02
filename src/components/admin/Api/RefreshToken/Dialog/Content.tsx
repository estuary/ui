import { DialogContent, Grid, TextField, Typography } from '@mui/material';
import SingleLineCode from 'components/content/SingleLineCode';
import AlertBox from 'components/shared/AlertBox';
import Error from 'components/shared/Error';
import { FormattedMessage, useIntl } from 'react-intl';
import { useRefreshTokenStore } from '../Store/create';
import GenerateButton from './GenerateButton';

function RefreshTokenContent() {
    const intl = useIntl();

    const token = useRefreshTokenStore((state) => state.token);

    const description = useRefreshTokenStore((state) => state.description);
    const updateDescription = useRefreshTokenStore(
        (state) => state.updateDescription
    );

    const serverError = useRefreshTokenStore((state) => state.serverError);

    return (
        <DialogContent>
            <Grid
                container
                spacing={3}
                sx={{ mb: 1, alignItems: 'flex-start' }}
            >
                {serverError ? (
                    <Grid item xs={12}>
                        <Error severity="error" error={serverError} condensed />
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
                        helperText={intl.formatMessage({
                            id: 'admin.cli_api.refreshToken.dialog.label',
                        })}
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
    );
}

export default RefreshTokenContent;
