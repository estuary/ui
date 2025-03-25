import { Link, useMediaQuery, useTheme } from '@mui/material';
import { Link as ReactRouterLink } from 'react-router-dom';
import type { BaseComponentProps } from 'types';
import { OpenNewWindow } from 'iconoir-react';

interface Props extends BaseComponentProps {
    link: string;
    ariaLabel?: string;
    newWindow?: boolean;
}

function LinkWrapper({ ariaLabel, children, link, newWindow }: Props) {
    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Link
            reloadDocument={false}
            component={ReactRouterLink}
            target={newWindow ? '_blank' : undefined}
            to={link}
            aria-label={ariaLabel}
            sx={{
                display: 'flex',
                alignItems: 'center',
                padding: 1,
                pl: 0,
                overflowWrap: belowMd ? 'break-word' : undefined,
                wordBreak: belowMd ? 'break-all' : undefined,
            }}
        >
            {children}
            {newWindow ? (
                <OpenNewWindow
                    style={{ height: 15, width: 15, marginLeft: 5 }}
                />
            ) : null}
        </Link>
    );
}

export default LinkWrapper;
