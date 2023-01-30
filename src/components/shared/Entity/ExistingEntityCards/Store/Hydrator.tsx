import {
    useExistingEntity_hydrated,
    useExistingEntity_hydrateState,
    useExistingEntity_setHydrated,
    useExistingEntity_setHydrationErrorsExist,
} from 'components/shared/Entity/ExistingEntityCards/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import { useEffectOnce } from 'react-use';
import { BaseComponentProps } from 'types';

function ExistingEntityHydrator({ children }: BaseComponentProps) {
    const entityType = useEntityType();

    const hydrated = useExistingEntity_hydrated();
    const setHydrated = useExistingEntity_setHydrated();

    const setHydrationErrorsExist = useExistingEntity_setHydrationErrorsExist();

    const hydrateState = useExistingEntity_hydrateState();

    useEffectOnce(() => {
        if (
            !hydrated &&
            (entityType === 'capture' || entityType === 'materialization')
        ) {
            hydrateState(entityType).then(
                () => {
                    setHydrated(true);
                },
                () => {
                    setHydrated(true);
                    setHydrationErrorsExist(true);
                }
            );
        }
    });

    return <div>{children}</div>;
}

export default ExistingEntityHydrator;
