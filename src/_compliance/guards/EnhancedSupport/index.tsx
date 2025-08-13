import type { BaseComponentProps } from 'src/types';

import { useState } from 'react';

import { Box, Grid } from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import EnhancedSupport from 'src/_compliance/guards/EnhancedSupport/EnhancedSupport';
import SupportBenefits from 'src/_compliance/guards/EnhancedSupport/SupportBenefits';
import SupportDetails from 'src/_compliance/guards/EnhancedSupport/SupportDetails';
import FullPageWrapper from 'src/app/FullPageWrapper';
import FullPageError from 'src/components/fullPage/Error';

function EnhancedSupportGuard({ children }: BaseComponentProps) {
    const intl = useIntl();

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
                    <>
                        {intl.formatMessage(
                            { id: 'legal.error.failedToFetch.message' },
                            {
                                privacy: (
                                    <FormattedMessage id="legal.docs.privacy" />
                                ),
                                terms: (
                                    <FormattedMessage id="legal.docs.terms" />
                                ),
                            }
                        )}
                    </>
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

export default EnhancedSupportGuard;
