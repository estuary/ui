import FullPageError from 'components/fullPage/Error';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps } from 'types';
import {
    useConnectorsStore_hydrated,
    useConnectorsStore_hydrationErrors,
    useHydrateState,
} from './hooks';

export const ConnectorsHydrator = ({ children }: BaseComponentProps) => {
    // Start fetching the prefixes they have access to
    useHydrateState();

    // The rest of the stuff we need to handle hydration
    const hydrated = useConnectorsStore_hydrated();
    const hydrationErrors = useConnectorsStore_hydrationErrors();

    if (!hydrated) {
        return null;
    }

    if (hydrationErrors) {
        return (
            <FullPageError
                error={hydrationErrors}
                message={
                    <FormattedMessage id="connectorsHydrator.error.failedToFetch" />
                }
            />
        );
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};
