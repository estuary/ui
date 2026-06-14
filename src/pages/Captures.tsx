import type { SxProps, Theme } from '@mui/material';

import { Box, Button, Toolbar } from '@mui/material';

import { Plus, Sparks } from 'iconoir-react';
import { useIntl } from 'react-intl';
import { NavLink } from 'react-router-dom';

import { authenticatedRoutes } from 'src/app/routes';
import { NEW_DATAFLOW_OPENER } from 'src/components/copilot/shared';
import CapturesTable from 'src/components/tables/Captures';
import usePageTitle from 'src/hooks/usePageTitle';
import { useCopilotAssistantStore } from 'src/stores/Copilot/Store';

const boxStyling: SxProps<Theme> = { marginBottom: 2, padding: 2 };

const Capture = () => {
    usePageTitle({
        header: authenticatedRoutes.captures.title,
        headerLink: 'https://docs.estuary.dev/concepts/#captures',
    });

    const intl = useIntl();

    const openWithOpener = useCopilotAssistantStore(
        (state) => state.openWithOpener
    );

    return (
        <>
            <Toolbar
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NavLink
                        style={{ textDecoration: 'none' }}
                        to={authenticatedRoutes.captures.create.fullPath}
                    >
                        <Button
                            size="large"
                            startIcon={<Plus style={{ fontSize: 14 }} />}
                        >
                            {intl.formatMessage({
                                id: 'capturesTable.cta.new',
                            })}
                        </Button>
                    </NavLink>

                    <Button
                        size="large"
                        variant="outlined"
                        startIcon={<Sparks style={{ fontSize: 14 }} />}
                        onClick={() => openWithOpener(NEW_DATAFLOW_OPENER)}
                    >
                        New Dataflow
                    </Button>
                </Box>
            </Toolbar>

            <Box sx={boxStyling}>
                <CapturesTable />
            </Box>
        </>
    );
};

export default Capture;
