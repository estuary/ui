import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Typography,
    useTheme,
} from '@mui/material';
import { generateGrantDirective } from 'api/directives';
import AutocompletedField from 'components/shared/toolbar/AutocompletedField';
import AccessLinksTable from 'components/tables/AccessGrants/AccessLinks';
import { useZustandStore } from 'context/Zustand/provider';
import { Cancel } from 'iconoir-react';
import { Dispatch, SetStateAction, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';

const TITLE_ID = 'share-prefix-dialog-title';

interface Props {
    objectRoles: string[];
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

interface GrantConfig {
    prefix: string;
    capability: string;
    reusability?: string;
}

// The write capability should be obscured to the user. It is more challenging
// for a user to understand the nuances of this grant and likely will not be used
// outside of advanced cases.

const capabilityOptions = ['admin', 'read'];

const typeOptions = ['single-use', 'multi-use'];

function SharePrefixDialog({ objectRoles, open, setOpen }: Props) {
    const theme = useTheme();
    const intl = useIntl();

    const hydrate = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['hydrate']
    >(
        SelectTableStoreNames.ACCESS_GRANTS_LINKS,
        selectableTableStoreSelectors.query.hydrate
    );

    const [grantConfig, setGrantConfig] = useState<GrantConfig>({
        prefix: objectRoles[0],
        capability: capabilityOptions[0],
        reusability: typeOptions[0],
    });

    const handlers = {
        closeDialog: (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            setOpen(false);
        },
        setGrantPrefix: (_event: React.SyntheticEvent, value: string) => {
            const { capability, reusability } = grantConfig;

            setGrantConfig({ prefix: value, capability, reusability });
        },
        setGrantCapability: (_event: React.SyntheticEvent, value: string) => {
            const { prefix, reusability } = grantConfig;

            setGrantConfig({ prefix, capability: value, reusability });
        },
        setGrantReusability: (_event: React.SyntheticEvent, value: string) => {
            const { prefix, capability } = grantConfig;

            setGrantConfig({ prefix, capability, reusability: value });
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
                    <Grid item xs={12} md={5}>
                        <AutocompletedField
                            label={intl.formatMessage({
                                id: 'common.tenant',
                            })}
                            options={objectRoles}
                            defaultValue={objectRoles[0]}
                            changeHandler={handlers.setGrantPrefix}
                        />
                    </Grid>

                    <Grid item xs={4} md={2}>
                        <AutocompletedField
                            label={intl.formatMessage({
                                id: 'admin.users.sharePrefix.label.capability',
                            })}
                            options={capabilityOptions}
                            defaultValue={capabilityOptions[0]}
                            changeHandler={handlers.setGrantCapability}
                        />
                    </Grid>

                    <Grid item xs={4} md={2}>
                        <AutocompletedField
                            label={intl.formatMessage({
                                id: 'admin.users.sharePrefix.label.type',
                            })}
                            options={typeOptions}
                            defaultValue={typeOptions[0]}
                            changeHandler={handlers.setGrantReusability}
                        />
                    </Grid>

                    <Grid item xs={4} md={3} sx={{ display: 'flex' }}>
                        <Button
                            onClick={() => {
                                generateGrantDirective(
                                    grantConfig.prefix,
                                    grantConfig.capability,
                                    grantConfig.reusability === 'single-use'
                                ).then(
                                    (response) => {
                                        console.log('success', response);

                                        hydrate();
                                    },
                                    (error) => console.log('error', error)
                                );
                            }}
                            sx={{ flexGrow: 1 }}
                        >
                            <FormattedMessage id="admin.users.sharePrefix.cta.generateLink" />
                        </Button>
                    </Grid>
                </Grid>

                <AccessLinksTable prefixes={objectRoles} />
            </DialogContent>
        </Dialog>
    );
}

export default SharePrefixDialog;
