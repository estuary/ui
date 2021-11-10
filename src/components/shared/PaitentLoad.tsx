import { Fade, LinearProgress } from '@mui/material';
import PropTypes from 'prop-types';

PaitentLoad.propTypes = {
    on: PropTypes.any.isRequired,
};

function PaitentLoad(
    props: PropTypes.InferProps<typeof PaitentLoad.propTypes>
) {
    return (
        <Fade
            in={props.on}
            style={{
                transitionDelay: props.on ? '900ms' : '0ms',
            }}
            unmountOnExit
        >
            <LinearProgress color="secondary" />
        </Fade>
    );
}

export default PaitentLoad;
