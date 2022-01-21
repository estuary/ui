import { Alert, AlertTitle } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';

const Error: React.FC = () => {
    return (
        <PageContainer>
            <Alert severity="error">
                <AlertTitle>Error</AlertTitle>
                This path does not exist.
            </Alert>
        </PageContainer>
    );
};

export default Error;
