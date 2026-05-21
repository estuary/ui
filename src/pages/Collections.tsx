import type { SxProps, Theme } from '@mui/material';

import { Box,  } from '@mui/material';


import { authenticatedRoutes } from 'src/app/routes';
import CollectionsTable from 'src/components/tables/Collections';
import usePageTitle from 'src/hooks/usePageTitle';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

const Collections = () => {
    usePageTitle({
        header: authenticatedRoutes.collections.title,
        headerLink: 'https://docs.estuary.dev/concepts/#collections',
    });

    return (
            <Box sx={boxStyling}>
                <CollectionsTable />
            </Box>
    );
};

export default Collections;
