import type { ReactNode } from 'react';

import { Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

interface Props {
    header: string | ReactNode | null;
    marginBottom?: number;
}

// Allowing header to be a node _kinda_ is doing what the
//  toolbar property for the table already did. However,
//  the toolbar props felt like it was meant for _toolbars_
//  and now a title that is styled different.
function Title({ header, marginBottom }: Props) {
    if (!header) {
        return null;
    }

    if (typeof header === 'string') {
        return (
            <Typography
                component="span"
                sx={{
                    mb: marginBottom,
                    alignItems: 'center',
                    fontSize: 18,
                    fontWeight: '400',
                }}
            >
                <FormattedMessage id={header} />
            </Typography>
        );
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{header}</>;
}

export default Title;
