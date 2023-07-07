import { Link, useMediaQuery, useTheme } from '@mui/material';
import { Link as ReactRouterLink } from 'react-router-dom';

interface Props {
    link: string;
    name: string;
}

function LinkWrapper({ link, name }: Props) {
    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Link
            reloadDocument={false}
            component={ReactRouterLink}
            to={link}
            state={{
                backButtonUrl: `${window.location.pathname}${window.location.search}`,
            }}
            sx={{
                padding: 1,
                pl: 0,
                overflowWrap: belowMd ? 'break-word' : undefined,
                wordBreak: belowMd ? 'break-all' : undefined,
            }}
        >
            {name}
        </Link>
    );
}

export default LinkWrapper;
