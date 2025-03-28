import { Stack, Typography } from '@mui/material';
import ExternalLink from 'src/components/shared/ExternalLink';
import { useIntl } from 'react-intl';
import { StandAloneTableTitleProps } from './types';

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
            sx={{ m: 2, mb: 0 }}
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
