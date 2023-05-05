import {
    Box,
    Button,
    Chip,
    Collapse,
    ListItem,
    Stack,
    Typography,
} from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { useResourceConfig_collections } from 'stores/ResourceConfig/hooks';
import SchemaEvolution from '../Actions/SchemaEvolution';

// const fakeCollections = [
//     'acmeCo/anvils/Stark/Pacheco',
//     'acmeCo/anvils/Greene/WaltonReallyLongNameForThisOne',
//     'acmeCo/anvils/Freda/Oliver',
//     'acmeCo/anvils/Shana/Keller',
//     'acmeCo/anvils/Marshall/Chambers',
//     'acmeCo/anvils/Maynard/Branch',
//     'acmeCo/anvils/Hester/Miller',
//     'acmeCo/anvils/Ferrell/WillisAlsoHasALongNameForAnEntity',
//     'acmeCo/anvils/Walls/Figueroa',
//     'acmeCo/anvils/Augusta/Carney',
//     'acmeCo/anvils/Higgins/York',
//     'acmeCo/anvils/Christian/Moody',
//     'acmeCo/anvils/Judy/Camacho',
//     'acmeCo/anvils/Zamora/CoteWantedToHaveALongNameAsWell',
//     'acmeCo/anvils/Darla/Mcguire',
//     'acmeCo/anvils/Shari/Guerrero',
// ];
function IncompatibleSchema() {
    const [open, setOpen] = useState(true);

    const formActive = useFormStateStore_isActive();
    const setFormState = useFormStateStore_setFormState();
    const collections = useResourceConfig_collections();

    if (!collections) {
        return null;
    }

    return (
        <Collapse
            in={open}
            sx={{
                mb: open ? 2 : undefined,
            }}
            unmountOnExit
        >
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
                            disabled={formActive}
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            <FormattedMessage id="cta.cancel" />
                        </Button>
                        <SchemaEvolution
                            onFailure={(formState) => {
                                setFormState({
                                    status: FormStatus.SCHEMA_EVOLVING_FAILED,
                                    ...formState,
                                });
                            }}
                        />
                    </Box>
                </Stack>
            </AlertBox>
        </Collapse>
    );
}

export default IncompatibleSchema;
