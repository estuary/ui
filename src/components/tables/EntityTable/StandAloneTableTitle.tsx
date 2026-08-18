import type { StandAloneTableTitleProps } from 'src/components/tables/EntityTable/types';

import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import ExternalLink from 'src/components/shared/ExternalLink';

// Used when you want to display the title outside of the table
//  ex: admin > settings tables
function StandAloneTableTitle({
    titleIntlKey,
    docsUrl,
    messageIntlKey,
}: StandAloneTableTitleProps) {
    const intl = useIntl();

    return (
        <Stack
            direction="column"
            spacing={messageIntlKey ? 2 : 0}
            // Vertical only. The 16px of horizontal margin here set every
            // section heading on Admin > Settings 16px right of the page's
            // own left edge, while the tables under them sat flush.
            sx={{ mt: 2 }}
        >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
                <Typography component="div" variant="h6">
                    {intl.formatMessage({
                        id: titleIntlKey,
                    })}
                </Typography>

                {docsUrl ? (
                    <ExternalLink link={docsUrl} sx={{ ml: 0 }}>
                        {intl.formatMessage({ id: 'terms.documentation' })}
                    </ExternalLink>
                ) : null}
            </Stack>

            {messageIntlKey ? (
                <Typography>
                    {intl.formatMessage({
                        id: 'storageMappings.message',
                    })}
                </Typography>
            ) : null}
        </Stack>
    );
}

export default StandAloneTableTitle;
