import FullPageError from 'components/fullPage/Error';
import FullPageSpinner from 'components/fullPage/Spinner';
import ClickToAccept from 'directives/ClickToAccept';
import FullPageWrapper from 'directives/FullPageWrapper';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps } from 'types';
import useDirectiveGuard from './hooks';

const SELECTED_DIRECTIVE = 'clickToAccept';

function LegalGuard({ children }: BaseComponentProps) {
    const { directive, error, loading, status, mutate } =
        useDirectiveGuard(SELECTED_DIRECTIVE);

    if (loading || status === null) {
        return <FullPageSpinner />;
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
                <ClickToAccept
                    directive={directive}
                    status={status}
                    mutate={mutate}
                />
            </FullPageWrapper>
        );
    } else {
        // Only returning the child and need the JSX Fragment
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default LegalGuard;
