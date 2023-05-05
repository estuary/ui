import {
    Box,
    Button,
    Chip,
    Collapse,
    ListItem,
    Stack,
    Typography,
} from '@mui/material';
import { RealtimeSubscription } from '@supabase/supabase-js';
import AlertBox from 'components/shared/AlertBox';
import { useClient } from 'hooks/supabase-swr';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useFormStateStore_setFormState } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import UpdateCollections from '../Actions/UpdateCollections';

const fakeCollections = [
    'acmeCo/anvils/Stark/Pacheco',
    'acmeCo/anvils/Greene/WaltonReallyLongNameForThisOne',
    'acmeCo/anvils/Freda/Oliver',
    'acmeCo/anvils/Shana/Keller',
    'acmeCo/anvils/Marshall/Chambers',
    'acmeCo/anvils/Maynard/Branch',
    'acmeCo/anvils/Hester/Miller',
    'acmeCo/anvils/Ferrell/WillisAlsoHasALongNameForAnEntity',
    'acmeCo/anvils/Walls/Figueroa',
    'acmeCo/anvils/Augusta/Carney',
    'acmeCo/anvils/Higgins/York',
    'acmeCo/anvils/Christian/Moody',
    'acmeCo/anvils/Judy/Camacho',
    'acmeCo/anvils/Zamora/CoteWantedToHaveALongNameAsWell',
    'acmeCo/anvils/Darla/Mcguire',
    'acmeCo/anvils/Shari/Guerrero',
];
function IncompatibleSchema() {
    const collections = fakeCollections;

    const [open, setOpen] = useState(true);

    const supabaseClient = useClient();
    const setFormState = useFormStateStore_setFormState();

    const callFailed = (
        formState: any,
        subscription?: RealtimeSubscription
    ) => {
        const setFailureState = () => {
            setFormState({
                status: FormStatus.FAILED,
                ...formState,
            });
        };
        if (subscription) {
            supabaseClient
                .removeSubscription(subscription)
                .then(() => {
                    setFailureState();
                })
                .catch(() => {});
        } else {
            setFailureState();
        }
    };

    return (
        <Collapse in={open} unmountOnExit>
            <AlertBox
                short
                severity="error"
                title={<FormattedMessage id="entityEvolution.error.title" />}
            >
                <Stack spacing={2}>
                    <Box>
                        <Typography>
                            <FormattedMessage id="entityEvolution.error.message" />
                        </Typography>

                        <Typography variant="subtitle2">
                            <FormattedMessage id="entityEvolution.error.note" />
                        </Typography>
                    </Box>

                    <Stack
                        direction="row"
                        component="ul"
                        sx={{
                            maxHeight: 125,
                            flexFlow: 'wrap',
                            overflowY: 'auto',
                            pl: 0,
                            ml: 1,
                        }}
                    >
                        {collections.map((collectionName: string) => {
                            return (
                                <ListItem
                                    key={`evolving-collections-${collectionName}`}
                                    dense
                                    sx={{ px: 0.5, width: 'auto' }}
                                >
                                    <Chip label={collectionName} />
                                </ListItem>
                            );
                        })}
                    </Stack>

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <Button
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            <FormattedMessage id="cta.cancel" />
                        </Button>
                        <UpdateCollections onFailure={callFailed} />
                    </Box>
                </Stack>
            </AlertBox>
        </Collapse>
    );
}

export default IncompatibleSchema;
