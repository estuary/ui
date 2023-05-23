import FullPageError from 'components/fullPage/Error';
import FullPageSpinner from 'components/fullPage/Spinner';
import { FormattedMessage } from 'react-intl';
import { useEffectOnce } from 'react-use';
import { BaseComponentProps } from 'types';

import {
    useEntitiesStore_hydrate,
    useEntitiesStore_hydrated,
    useEntitiesStore_hydrationErrors,
} from './hooks';

export const EntitiesHydrator = ({ children }: BaseComponentProps) => {
    const hydrateState = useEntitiesStore_hydrate();
    const hydrated = useEntitiesStore_hydrated();
    const hydrationErrors = useEntitiesStore_hydrationErrors();

    useEffectOnce(() => {
        if (!hydrated) {
            void hydrateState();
        }
    });

    if (!hydrated) {
        return <FullPageSpinner />;
    }

    if (hydrationErrors) {
        return (
            <FullPageError
                error={hydrationErrors}
                title={<FormattedMessage id="fullpage.error" />}
            />
        );
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};
