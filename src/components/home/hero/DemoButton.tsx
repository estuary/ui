import { useCallback, useState } from 'react';

import { Box, Grid, Link } from '@mui/material';

import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { authenticatedRoutes } from 'src/app/routes';
import DemoDialog from 'src/components/home/hero/DemoDialog';
import { semiTransparentBackgroundIntensified } from 'src/context/Theme';
import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';
import { useEntitiesStore_capabilities_adminable } from 'src/stores/Entities/hooks';
import { TableFilterKeys, TablePrefixes } from 'src/stores/Tables/hooks';
import {
    DEMO_TENANT,
    getPathWithParams,
    hasLength,
} from 'src/utils/misc-utils';

export const FILTER_TABLE_PROPS = {
    captures: {
        [`${TablePrefixes.captures}-${TableFilterKeys.searchQuery}`]: `${DEMO_TENANT}wikipedia/recent-changes`,
    },
    collections: {
        [`${TablePrefixes.collections}-${TableFilterKeys.searchQuery}`]: `${DEMO_TENANT}wikipedia/lines-and-bots`,
    },
    materializations: {
        [`${TablePrefixes.materializations}-${TableFilterKeys.searchQuery}`]: `${DEMO_TENANT}wikipedia/lines-by-usertype`,
    },
};

interface Props {
    step: number;
    type: keyof typeof FILTER_TABLE_PROPS;
}

function DemoButton({ step, type }: Props) {
    const navigate = useNavigate();

    const objectRoles = useEntitiesStore_capabilities_adminable();

    const demoAccessExists = useUserInfoSummaryStore(
        (state) => state.hasDemoAccess
    );

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

    if (!hasLength(objectRoles)) {
        return null;
    }

    return (
        <>
            <Grid
                size={{ xs: 4 }}
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
