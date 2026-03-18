import type { BaseComponentProps } from 'src/types';

import { FormattedMessage } from 'react-intl';
import { useMount } from 'react-use';

import FullPageError from 'src/components/fullPage/Error';
import { logRocketEvent } from 'src/services/shared';
import { useHydrateStateWithPostgres } from 'src/stores/Entities/hooks';
import { useEntitiesStore } from 'src/stores/Entities/Store';

export const EntitiesHydrator = ({ children }: BaseComponentProps) => {
    // Start fetching the prefixes the user has access to
    useHydrateStateWithPostgres();

    // The rest of the stuff we need to handle hydration
    const [hydrated, hydrationErrors] = useEntitiesStore((state) => [
        state.hydrated,
        state.hydrationErrors,
    ]);

    useMount(() => {
        logRocketEvent('authroles', {
            fetching: true,
            usedPostgrest: true,
        });
    });

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
