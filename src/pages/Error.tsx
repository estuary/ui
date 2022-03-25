import { Alert, AlertTitle, Box } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import { NavLink } from 'react-router-dom';

const Error = () => {
    return (
        <PageContainer>
            <Alert severity="error">
                <AlertTitle>Error</AlertTitle>
                <Box>This path does not exist.</Box>
                <NavLink to="/">Return to homepage</NavLink>
            </Alert>
        </PageContainer>
    );
};

export default Error;
