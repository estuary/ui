import type { BaseComponentProps } from 'src/types';

import { useShallow } from 'zustand/react/shallow';

import { useMount } from 'react-use';

import FullPageError from 'src/components/fullPage/Error';
import { logRocketEvent } from 'src/services/shared';
import { useHydrateStateWithGql } from 'src/stores/Entities/hooks';
import { useEntitiesStore } from 'src/stores/Entities/Store';

export const EntitiesHydratorForSupport = ({
    children,
}: BaseComponentProps) => {
    // Start fetching the prefixes the user has access to
    useHydrateStateWithGql();

    // The rest of the stuff we need to handle hydration
    const [hydrated, hydrationErrors] = useEntitiesStore(
        useShallow((state) => [state.hydrated, state.hydrationErrors])
    );

    useMount(() => {
        logRocketEvent('authroles', {
            fetching: true,
            usedGql: true,
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
                    <>
                        There was an issue while checking if you have any roles.
                    </>
                }
            />
        );
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};
