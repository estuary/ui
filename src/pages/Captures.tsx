import { Plus } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
import { NavLink } from 'react-router-dom';

import { Box, Button, SxProps, Theme, Toolbar } from '@mui/material';

import { authenticatedRoutes } from 'app/routes';

import CapturesTable from 'components/tables/Captures';

import usePageTitle from 'hooks/usePageTitle';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

const Capture = () => {
    usePageTitle({
        header: authenticatedRoutes.captures.title,
        headerLink: 'https://docs.estuary.dev/concepts/#captures',
    });

    return (
        <>
            <Toolbar
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
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
            </Toolbar>

            <Box sx={boxStyling}>
                <CapturesTable />
            </Box>
        </>
    );
};

export default Capture;
