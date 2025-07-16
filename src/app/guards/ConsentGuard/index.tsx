import type { BaseComponentProps } from 'src/types';

import { useState } from 'react';

import { Box, Grid } from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import FullPageWrapper from 'src/app/FullPageWrapper';
import FullPageError from 'src/components/fullPage/Error';
import CardWrapper from 'src/components/shared/CardWrapper';
import KeyValueList from 'src/components/shared/KeyValueList';

function ConsentGuard({ children }: BaseComponentProps) {
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
                            <CardWrapper message="What’s included?">
                                <KeyValueList
                                    data={[
                                        {
                                            title: intl.formatMessage({
                                                id: 'supportConsent.benefits.list1',
                                            }),
                                        },
                                        {
                                            title: intl.formatMessage({
                                                id: 'supportConsent.benefits.list2',
                                            }),
                                        },
                                        {
                                            title: intl.formatMessage({
                                                id: 'supportConsent.benefits.list3',
                                            }),
                                        },
                                    ]}
                                />
                            </CardWrapper>

                            <CardWrapper message="How it works:">
                                <KeyValueList
                                    data={[
                                        {
                                            title: intl.formatMessage({
                                                id: 'supportConsent.details.list1',
                                            }),
                                        },
                                        {
                                            title: intl.formatMessage({
                                                id: 'supportConsent.details.list2',
                                            }),
                                        },
                                        {
                                            title: intl.formatMessage({
                                                id: 'supportConsent.details.list3',
                                            }),
                                        },
                                        {
                                            title: `For details, see our Privacy Policy and Support
                                Terms`,
                                        },
                                    ]}
                                />
                            </CardWrapper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            form go here
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
