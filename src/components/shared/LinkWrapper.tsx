import type { BaseComponentProps } from 'src/types';

import { Link, useMediaQuery, useTheme } from '@mui/material';

import { OpenNewWindow } from 'iconoir-react';
import { Link as ReactRouterLink } from 'react-router-dom';

interface Props extends BaseComponentProps {
    link: string;
    ariaLabel?: string;
    newWindow?: boolean;
    // Renders as an anchor with none of Link's own color/underline styling —
    // for when a larger element (a whole clickable row) already carries the
    // click affordance, so this text doesn't separately advertise itself as
    // a narrower target.
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
