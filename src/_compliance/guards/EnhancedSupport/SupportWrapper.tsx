import type { SupportWrapperProps } from 'src/_compliance/guards/EnhancedSupport/types';

import { Stack } from '@mui/material';

import { useIntl } from 'react-intl';

import CardWrapper from 'src/components/shared/CardWrapper';

function SupportWrapper({ titleMessageId, children }: SupportWrapperProps) {
    const intl = useIntl();

    return (
        <CardWrapper
            message={intl.formatMessage({
                id: titleMessageId,
            })}
        >
            <Stack
                useFlexGap
                direction={{ xs: 'column' }}
                spacing={2}
                sx={{
                    alignItems: 'start',
                    pl: 2,
                }}
            >
                {children}
            </Stack>
        </CardWrapper>
    );
}

export default SupportWrapper;
