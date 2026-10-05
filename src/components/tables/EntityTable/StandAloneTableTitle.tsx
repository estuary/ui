import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import ExternalLink from 'src/components/shared/ExternalLink';

interface StandAloneTableTitleProps {
    title: string;
    docsUrl?: string;
    message?: string;
}

// Used when you want to display the title outside of the table
//  ex: admin > settings tables
export function StandAloneTableTitle({
    title,
    docsUrl,
    message,
}: StandAloneTableTitleProps) {
    return (
        <Stack
            direction="column"
            spacing={message ? 2 : 0}
            // Vertical only. The 16px of horizontal margin here set every
            // section heading on Admin > Settings 16px right of the page's
            // own left edge, while the tables under them sat flush.
            sx={{ mt: 2 }}
        >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
                <Typography component="div" variant="h6">
                    {title}
                </Typography>

                {docsUrl ? (
                    <ExternalLink link={docsUrl} sx={{ ml: 0 }}>
                        Docs
                    </ExternalLink>
                ) : null}
            </Stack>

            {message ? <Typography>{message}</Typography> : null}
        </Stack>
    );
}

/** @deprecated Prefer the named `StandAloneTableTitle` export */
function StandAloneTableTitleWrapper({
    titleIntlKey,
    messageIntlKey,
    ...props
}: Omit<StandAloneTableTitleProps, 'title' | 'message'> & {
    titleIntlKey: string;
    messageIntlKey?: string;
}) {
    const intl = useIntl();

    return (
        <StandAloneTableTitle
            {...props}
            title={intl.formatMessage({ id: titleIntlKey })}
            message={
                messageIntlKey
                    ? intl.formatMessage({ id: messageIntlKey })
                    : undefined
            }
        />
    );
}

export default StandAloneTableTitleWrapper;
