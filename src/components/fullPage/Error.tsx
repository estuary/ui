import { Divider, Stack, Typography } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import Error from 'components/shared/Error';
import { ErrorDetails } from 'components/shared/Error/types';
import FullPageWrapper from 'directives/FullPageWrapper';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    error: ErrorDetails;
    message?: ReactElement;
    title?: ReactElement | string;
}
function FullPageError({ error, message, title }: Props) {
    return (
        <FullPageWrapper>
            <Stack spacing={2}>
                <Typography variant="h5">
                    {title ? (
                        title
                    ) : (
                        <FormattedMessage id="common.failedFetch" />
                    )}
                </Typography>
                {message ? (
                    <Typography variant="subtitle1">{message}</Typography>
                ) : null}
                <Typography variant="subtitle1">
                    <MessageWithLink messageID="fullPage.instructions" />
                </Typography>
                <Divider />
                <Error error={error} condensed />
            </Stack>
        </FullPageWrapper>
    );
}

export default FullPageError;
