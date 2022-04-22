import { Container, Toolbar } from '@mui/material';
import useBrowserTitle from 'hooks/useBrowserTitle';

const Collections = () => {
    useBrowserTitle('browserTitle.collections');

    return (
        <Container
            sx={{
                pt: 2,
            }}
        >
            <Toolbar />
        </Container>
    );
};

export default Collections;
