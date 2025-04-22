import type { SxProps, Theme } from '@mui/material';

import { Box, Button, Stack, Toolbar } from '@mui/material';

import { Plus } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
import { NavLink } from 'react-router-dom';
import { useUnmount } from 'react-use';

import { authenticatedRoutes } from 'src/app/routes';
import CapturesTable from 'src/components/tables/Captures';
import usePageTitle from 'src/hooks/usePageTitle';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

const boxStyling: SxProps<Theme> = { marginBottom: 2, padding: 2 };

const Capture = () => {
    usePageTitle({
        header: authenticatedRoutes.captures.title,
        headerLink: 'https://docs.estuary.dev/concepts/#captures',
    });

    const resetState = useWorkflowStore((state) => state.resetState);

    useUnmount(() => resetState());

    return (
        <>
            <Toolbar
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                <Stack direction="row" spacing={1}>
                    <NavLink
                        style={{ textDecoration: 'none' }}
                        to={authenticatedRoutes.captures.create.fullPath}
                    >
                        <Button
                            size="large"
                            startIcon={<Plus style={{ fontSize: 14 }} />}
                        >
                            <FormattedMessage id="capturesTable.cta.new" />
                        </Button>
                    </NavLink>

                    <NavLink
                        style={{ textDecoration: 'none' }}
                        to={authenticatedRoutes.express.captureCreate.fullPath}
                    >
                        <Button
                            color="info"
                            size="large"
                            startIcon={<Plus style={{ fontSize: 14 }} />}
                        >
                            <FormattedMessage id="capturesTable.cta.new" />
                        </Button>
                    </NavLink>
                </Stack>
            </Toolbar>

            <Box sx={boxStyling}>
                <CapturesTable />
            </Box>
        </>
    );
};

export default Capture;
