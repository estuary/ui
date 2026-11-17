import type { BaseComponentProps } from 'src/types';

import { Typography } from '@mui/material';

import MessageWithLink from 'src/components/content/MessageWithLink';
import AlertBox from 'src/components/shared/AlertBox';

function HydrationError({ children }: BaseComponentProps) {
    return (
        <AlertBox
            severity="error"
            title={
                <Typography component="span">
                    An issue was encountered initializing this section of the
                    form.
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
