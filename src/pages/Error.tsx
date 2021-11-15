import { Alert, AlertTitle } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';

export default function Error() {
    return (
        <PageContainer>
            <Alert severity="error">
                <AlertTitle>Error</AlertTitle>
                This path does not exist.
            </Alert>
        </PageContainer>
    );
}
