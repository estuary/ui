import { Box, SxProps, Theme } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import DashboardTable from 'components/tables/Dashboard';
import useBrowserTitle from 'hooks/useBrowserTitle';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

const Collections = () => {
    useBrowserTitle('browserTitle.collections');

    return (
        <PageContainer>
            <Box sx={boxStyling}>
                <DashboardTable />
            </Box>
        </PageContainer>
    );
};

export default Collections;
