import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

ExternalLink.propTypes = {
    children: PropTypes.any.isRequired,
    link: PropTypes.string.isRequired,
};

function ExternalLink(
    props: PropTypes.InferProps<typeof ExternalLink.propTypes>
) {
    return (
        <Button
            variant="text"
            endIcon={<OpenInNewIcon />}
            href={props.link}
            target="_blank"
            rel="noopener"
        >
            {props.children}
        </Button>
    );
}

export default ExternalLink;
