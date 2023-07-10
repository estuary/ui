import { Link, useMediaQuery, useTheme } from '@mui/material';
import { Link as ReactRouterLink } from 'react-router-dom';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    link: string;
}

function LinkWrapper({ children, link }: Props) {
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
            {children}
        </Link>
    );
}

export default LinkWrapper;
