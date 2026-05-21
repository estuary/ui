import type { SxProps, Theme } from '@mui/material';

import { Box } from '@mui/material';

import { authenticatedRoutes } from 'src/app/routes';
import CapturesTable from 'src/components/tables/Captures';
import usePageTitle from 'src/hooks/usePageTitle';

const boxStyling: SxProps<Theme> = { marginBottom: 2, padding: 2 };

const Capture = () => {
    usePageTitle({
        header: authenticatedRoutes.captures.title,
        headerLink: 'https://docs.estuary.dev/concepts/#captures',
    });

    return (
        <Box sx={boxStyling}>
            <CapturesTable />
        </Box>
    );
};

export default Capture;
