import { Box } from '@mui/material';

import useDirectiveGuard from './hooks';
import { FormattedMessage } from 'react-intl';

import FullPageWrapper from 'src/app/FullPageWrapper';
import FullPageError from 'src/components/fullPage/Error';
import ClickToAccept from 'src/directives/ClickToAccept';
import { BaseComponentProps } from 'src/types';

const SELECTED_DIRECTIVE = 'clickToAccept';

function LegalGuard({ children }: BaseComponentProps) {
    const { directive, error, loading, status, mutate } =
        useDirectiveGuard(SELECTED_DIRECTIVE);

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
            <FullPageWrapper>
                <Box
                    sx={{
                        p: 2,
                    }}
                >
                    <ClickToAccept
                        directive={directive}
                        status={status}
                        mutate={mutate}
                    />
                </Box>
            </FullPageWrapper>
        );
    } else {
        // Only returning the child and need the JSX Fragment
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default LegalGuard;
