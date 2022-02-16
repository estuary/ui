import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

ExternalLink.propTypes = {
    children: PropTypes.any.isRequired,
    link: PropTypes.string.isRequired,
    disableHover: PropTypes.bool,
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
            color="secondary"
            sx={{
                fontWeight: 700,
                '&:hover': {
                    // TODO: Retrieve the background hex code from AppTheme.tsx
                    backgroundColor: props.disableHover
                        ? 'transparent'
                        : '#F7F7F7',
                },
            }}
        >
            {props.children}
        </Button>
    );
}

export default ExternalLink;
