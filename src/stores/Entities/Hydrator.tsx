import { BaseComponentProps } from 'types';
import { FormattedMessage } from 'react-intl';

import FullPageError from 'components/fullPage/Error';
import FullPageSpinner from 'components/fullPage/Spinner';

import {
    useEntitiesStore_hydrated,
    useEntitiesStore_hydrationErrors,
    useHydrateState,
} from './hooks';

export const EntitiesHydrator = ({ children }: BaseComponentProps) => {
    // Start fetching the prefixes they have access to
    useHydrateState();

    // The rest of the stuff we need to handle hydration
    const hydrated = useEntitiesStore_hydrated();
    const hydrationErrors = useEntitiesStore_hydrationErrors();

    if (!hydrated) {
        return <FullPageSpinner />;
    }

    if (hydrationErrors) {
        return (
            <FullPageError
                error={hydrationErrors}
                message={
                    <FormattedMessage id="entitiesHydrator.error.failedToFetch" />
                }
            />
        );
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};
