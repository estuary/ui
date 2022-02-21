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
    const { children, link } = props;

    return (
        <Button
            variant="text"
            endIcon={<OpenInNewIcon />}
            href={link}
            target="_blank"
            rel="noopener"
            color="secondary"
            sx={{
                fontWeight: 700,
            }}
        >
            {children}
        </Button>
    );
}

export default ExternalLink;
