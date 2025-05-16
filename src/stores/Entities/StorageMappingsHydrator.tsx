import type { BaseComponentProps } from 'src/types';

import { FormattedMessage } from 'react-intl';

import FullPageError from 'src/components/fullPage/Error';
import { useHydrateStorageMappingsState } from 'src/stores/Entities/hooks';
import { useEntitiesStore } from 'src/stores/Entities/Store';

export const StorageMappingsHydrator = ({ children }: BaseComponentProps) => {
    // Start fetching the prefixes the user has access to
    useHydrateStorageMappingsState();

    // The rest of the stuff we need to handle hydration
    const [hydrationErrors] = useEntitiesStore((state) => [
        state.hydrationErrors,
    ]);

    if (hydrationErrors) {
        return (
            <FullPageError
                error={hydrationErrors}
                message={
                    <FormattedMessage id="storageMappingsHydrator.error.failedToFetch" />
                }
            />
        );
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};
