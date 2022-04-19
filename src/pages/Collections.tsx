import { Container, Toolbar } from '@mui/material';
import { useIntl } from 'react-intl';
import { useTitle } from 'react-use';

const Collections = () => {
    const intl = useIntl();
    useTitle(
        intl.formatMessage({
            id: 'browserTitle.collections',
        })
    );

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
