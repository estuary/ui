import {
    Alert,
    AlertTitle,
    Container,
    Fade,
    Paper,
    Toolbar,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';

const PageContainerPropTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,
};
type PageContainerProp = PropTypes.InferProps<typeof PageContainerPropTypes>;

function PageContainer(props: PageContainerProp) {
    const [fadeIn, setFadeIn] = useState(true);

    const { children } = props;

    const handlers = {
        entered: () => {
            // Set the property in to false to trigger an exit after a delay.
            setTimeout(() => {
                setFadeIn(false);
            }, 10000);
        },
    };

    return (
        <Container
            maxWidth={false}
            sx={{
                paddingTop: 2,
            }}
        >
            <Toolbar />

            <Fade
                in={fadeIn}
                timeout={1000}
                unmountOnExit
                onEntered={handlers.entered}
            >
                <Alert severity="success" sx={{ mb: 2 }}>
                    <AlertTitle>New Capture Created</AlertTitle>
                    Your changes can be viewed on the Builds page.
                </Alert>
            </Fade>

            <Paper sx={{ width: '100%' }} variant="outlined">
                {children}
            </Paper>
        </Container>
    );
}

export default PageContainer;
