import type { BaseComponentProps } from 'src/types';

import { Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import MessageWithLink from 'src/components/content/MessageWithLink';
import AlertBox from 'src/components/shared/AlertBox';

function HydrationError({ children }: BaseComponentProps) {
    const intl = useIntl();

    return (
        <AlertBox
            severity="error"
            title={
                <Typography component="span">
                    {intl.formatMessage({
                        id: 'workflows.error.initFormSection',
                    })}
                </Typography>
            }
            short
        >
            {children ? <Typography>{children}</Typography> : null}

            <MessageWithLink messageID="error.instructions" />
        </AlertBox>
    );
}

export default HydrationError;
