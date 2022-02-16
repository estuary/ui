import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link, MenuItem } from '@mui/material';
import PropTypes from 'prop-types';

ExternalLinkMenuItem.propTypes = {
    children: PropTypes.any.isRequired,
    link: PropTypes.string.isRequired,
};

function ExternalLinkMenuItem(
    props: PropTypes.InferProps<typeof ExternalLinkMenuItem.propTypes>
) {
    return (
        <MenuItem
            component={Link}
            href={props.link}
            target="_blank"
            rel="noopener"
            tabIndex={0}
            sx={{
                px: 3,
                py: 1.5,
                fontSize: 14,
                fontWeight: 700,
                color: '#3c5584',
                textTransform: 'uppercase',
            }}
        >
            <span>{props.children}</span>
            <OpenInNewIcon sx={{ width: 36, height: 20 }} />
        </MenuItem>
    );
}

export default ExternalLinkMenuItem;
