import {
    Button,
    Collapse,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Typography,
    useTheme,
} from '@mui/material';
import { generateGrantDirective } from 'api/directives';
import { unauthenticatedRoutes } from 'app/routes';
import SingleLineCode from 'components/content/SingleLineCode';
import AutocompletedField from 'components/shared/toolbar/AutocompletedField';
import AccessLinksTable from 'components/tables/AccessGrants/AccessLinks';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { Cancel } from 'iconoir-react';
import { Dispatch, SetStateAction, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

const TITLE_ID = 'share-prefix-dialog-title';

interface Props {
    tenants: string[];
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

interface GrantConfig {
    prefix: string;
    capability: string;
}

// The write capability should be obscured to the user. It is more challenging
// for a user to understand the nuances of this grant and likely will not be used
// outside of advanced cases.

const capabilityOptions = ['admin', 'read'];

function SharePrefixDialog({ tenants, open, setOpen }: Props) {
    const theme = useTheme();
    const intl = useIntl();

    const [grantConfig, setGrantConfig] = useState<GrantConfig>({
        prefix: tenants[0],
        capability: capabilityOptions[0],
    });

    const [linkCreated, setLinkCreated] = useState<boolean>(false);
    const [linkURL, setLinkURL] = useState<string>('');

    const handlers = {
        closeDialog: (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            setOpen(false);
        },
        setGrantPrefix: (_event: React.SyntheticEvent, value: string) => {
            if (linkCreated) {
                setLinkCreated(false);
                setLinkURL('');
            }

            const { capability } = grantConfig;

            setGrantConfig({ prefix: value, capability });
        },
        setGrantCapability: (_event: React.SyntheticEvent, value: string) => {
            if (linkCreated) {
                setLinkCreated(false);
                setLinkURL('');
            }
            const { prefix } = grantConfig;

            setGrantConfig({ prefix, capability: value });
        },
    };

    return (
        <Dialog
            open={open}
            maxWidth="md"
            fullWidth
            aria-labelledby={TITLE_ID}
            onClose={handlers.closeDialog}
        >
            <DialogTitle
                component="div"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Typography variant="h6">
                    <FormattedMessage id="admin.users.sharePrefix.header" />
                </Typography>

                <IconButton onClick={handlers.closeDialog}>
                    <Cancel
                        style={{
                            fontSize: '1rem',
                            color: theme.palette.text.primary,
                        }}
                    />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Typography sx={{ mb: 3 }}>
                    <FormattedMessage id="admin.users.sharePrefix.message" />
                </Typography>

                <Grid container spacing={2} sx={{ mb: 5 }}>
                    <Grid item xs={7}>
                        <AutocompletedField
                            label={intl.formatMessage({
                                id: 'common.tenant',
                            })}
                            options={tenants}
                            defaultValue={tenants[0]}
                            changeHandler={handlers.setGrantPrefix}
                        />
                    </Grid>

                    <Grid item xs={2}>
                        <AutocompletedField
                            label={intl.formatMessage({
                                id: 'admin.users.sharePrefix.label.capability',
                            })}
                            options={capabilityOptions}
                            defaultValue={capabilityOptions[0]}
                            changeHandler={handlers.setGrantCapability}
                        />
                    </Grid>

                    <Grid item xs={3} sx={{ display: 'flex' }}>
                        <Button
                            onClick={() => {
                                generateGrantDirective(
                                    grantConfig.prefix,
                                    grantConfig.capability
                                ).then(
                                    (response) => {
                                        console.log('success', response);

                                        if (
                                            response.data &&
                                            response.data.length > 0
                                        ) {
                                            setLinkURL(
                                                `${window.location.origin}${unauthenticatedRoutes.login.path}?${GlobalSearchParams.GRANT_TOKEN}=${response.data[0].token}`
                                            );
                                            setLinkCreated(true);
                                        }
                                    },
                                    (error) => console.log('error', error)
                                );
                            }}
                            sx={{ flexGrow: 1 }}
                        >
                            <FormattedMessage id="admin.users.sharePrefix.cta.generateLink" />
                        </Button>
                    </Grid>

                    <Grid item xs={12}>
                        <Collapse in={linkCreated}>
                            <SingleLineCode value={linkURL} />
                        </Collapse>
                    </Grid>
                </Grid>

                <AccessLinksTable prefixes={tenants} />
            </DialogContent>
        </Dialog>
    );
}

export default SharePrefixDialog;
