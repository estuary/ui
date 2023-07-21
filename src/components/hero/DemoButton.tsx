import { useCallback, useState } from 'react';

import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { Box, Grid, Link } from '@mui/material';

import { authenticatedRoutes } from 'app/routes';

import DemoDialog from 'components/hero/DemoDialog';

import { semiTransparentBackgroundIntensified } from 'context/Theme';

import {
    useEntitiesStore_capabilities_adminable,
    useEntitiesStore_capabilities_readable,
} from 'stores/Entities/hooks';

import { getPathWithParams } from 'utils/misc-utils';

export const FILTER_TABLE_PROPS = {
    captures: {
        'cap-sq': 'demo/wikipedia/recent-changes',
    },
    collections: {
        'col-sq': 'demo/wikipedia/lines-and-bots',
    },
    materializations: {
        'mat-sq': 'demo/wikipedia/lines-by-usertype',
    },
};

interface Props {
    step: number;
    type: keyof typeof FILTER_TABLE_PROPS;
}

function DemoButton({ step, type }: Props) {
    const navigate = useNavigate();

    const adminCapabilities = useEntitiesStore_capabilities_adminable();
    const objectRoles = Object.keys(adminCapabilities);

    const readCapabilities = useEntitiesStore_capabilities_readable();
    const demoAccessExists = Object.keys(readCapabilities).includes('demo/');

    const [open, setOpen] = useState(false);

    const goToFilteredTable = useCallback(() => {
        navigate(
            getPathWithParams(
                authenticatedRoutes[type].fullPath,
                FILTER_TABLE_PROPS[type]
            )
        );
    }, [navigate, type]);

    const evaluateObjectRoles = useCallback(
        () => (demoAccessExists ? goToFilteredTable() : setOpen(true)),
        [demoAccessExists, goToFilteredTable]
    );

    return (
        <>
            <Grid
                item
                xs={4}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <Box
                    sx={{
                        bgcolor: (theme) =>
                            semiTransparentBackgroundIntensified[
                                theme.palette.mode
                            ],
                        p: 2,
                        textAlign: 'center',
                        width: '75%',
                        mt: 2,
                    }}
                >
                    <Link
                        onClick={evaluateObjectRoles}
                        sx={{ cursor: 'pointer' }}
                    >
                        <FormattedMessage id={`home.hero.${step}.button`} />
                    </Link>
                </Box>
            </Grid>

            <DemoDialog
                objectRoles={objectRoles}
                open={open}
                setOpen={setOpen}
                goToFilteredTable={goToFilteredTable}
            />
        </>
    );
}

export default DemoButton;
