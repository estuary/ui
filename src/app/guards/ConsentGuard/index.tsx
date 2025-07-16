import type { BaseComponentProps } from 'src/types';

import { useState } from 'react';

import { Box, Grid } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import FullPageWrapper from 'src/app/FullPageWrapper';
import EnhancedSupport from 'src/app/guards/ConsentGuard/EnhancedSupport';
import SupportBenefits from 'src/app/guards/ConsentGuard/SupportBenefits';
import SupportDetails from 'src/app/guards/ConsentGuard/SupportDetails';
import FullPageError from 'src/components/fullPage/Error';

function ConsentGuard({ children }: BaseComponentProps) {
    const [loading] = useState(false);
    const [error] = useState<string | null>(null);

    if (loading || status === null) {
        return null;
    }

    if (error) {
        return (
            <FullPageError
                error={error}
                message={
                    <FormattedMessage
                        id="legal.error.failedToFetch.message"
                        values={{
                            privacy: (
                                <FormattedMessage id="legal.docs.privacy" />
                            ),
                            terms: <FormattedMessage id="legal.docs.terms" />,
                        }}
                    />
                }
            />
        );
    }

    if (status !== 'fulfilled') {
        return (
            <FullPageWrapper fullWidth>
                <Box
                    sx={{
                        p: 2,
                    }}
                >
                    <Grid
                        container
                        spacing={2}
                        sx={{
                            p: 2,
                        }}
                    >
                        <Grid item xs={6}>
                            <SupportBenefits />

                            <SupportDetails />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <EnhancedSupport />
                        </Grid>
                    </Grid>
                </Box>
            </FullPageWrapper>
        );
    } else {
        // Only returning the child and need the JSX Fragment
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default ConsentGuard;
