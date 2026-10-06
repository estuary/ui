import type { BaseComponentProps } from 'src/types';

import { Link, useMediaQuery, useTheme } from '@mui/material';

import { OpenNewWindow } from 'iconoir-react';
import { Link as ReactRouterLink } from 'react-router-dom';

interface Props extends BaseComponentProps {
    link: string;
    ariaLabel?: string;
    newWindow?: boolean;
    // An anchor without Link's colour and underline, for when a larger element
    // such as a clickable row carries the affordance.
    plain?: boolean;
}

function LinkWrapper({ ariaLabel, children, link, newWindow, plain }: Props) {
    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Link
            reloadDocument={false}
            component={ReactRouterLink}
            target={newWindow ? '_blank' : undefined}
            to={link}
            aria-label={ariaLabel}
            color={plain ? 'inherit' : undefined}
            underline={plain ? 'none' : undefined}
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
