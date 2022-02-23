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
    const { children, link } = props;
    return (
        <MenuItem
            component={Link}
            href={link}
            target="_blank"
            rel="noopener"
            tabIndex={0}
            sx={{
                color: '#3c5584',
                fontSize: 14,
                fontWeight: 700,
                px: 3,
                py: 1.5,
                textTransform: 'uppercase',
            }}
        >
            <span>{children}</span>
            <OpenInNewIcon sx={{ height: 20, width: 36 }} />
        </MenuItem>
    );
}

export default ExternalLinkMenuItem;
