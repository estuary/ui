import { Container, Paper, Toolbar } from '@mui/material';
import PropTypes from 'prop-types';

const PageContainerPropTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,
};
type PageContainerProp = PropTypes.InferProps<typeof PageContainerPropTypes>;

function PageContainer(props: PageContainerProp) {
    return (
        <Container
            maxWidth={false}
            sx={{
                paddingTop: 2,
            }}
        >
            <Toolbar />
            <Paper sx={{ width: '100%' }} variant="outlined">
                {props.children}
            </Paper>
        </Container>
    );
}

export default PageContainer;
