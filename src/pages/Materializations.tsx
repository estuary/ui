import type { SxProps, Theme } from '@mui/material';

import { Box } from '@mui/material';

import { authenticatedRoutes } from 'src/app/routes';
import MaterializationsTable from 'src/components/tables/Materializations';
import usePageTitle from 'src/hooks/usePageTitle';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

const Materializations = () => {
    usePageTitle({
        header: authenticatedRoutes.materializations.title,
        headerLink: 'https://docs.estuary.dev/concepts/#materializations',
    });

    return (
        <Box sx={boxStyling}>
            <MaterializationsTable />
        </Box>
    );
};

export default Materializations;
