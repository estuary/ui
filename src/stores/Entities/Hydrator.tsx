import FullPageError from 'components/fullPage/Error';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps } from 'types';
import { useHydrateState } from './hooks';
import { useEntitiesStore } from './Store';

export const EntitiesHydrator = ({ children }: BaseComponentProps) => {
    // Start fetching the prefixes the user has access to
    useHydrateState();

    // The rest of the stuff we need to handle hydration
    const [hydrated, hydrationErrors] = useEntitiesStore((state) => [
        state.hydrated,
        state.hydrationErrors,
    ]);

    if (!hydrated) {
        return null;
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
