import { Typography } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';

export default function Error() {
    return (
        <PageContainer>
            <Typography>
                Uh oh - looks like there was an error in the routing.
            </Typography>
        </PageContainer>
    );
}
