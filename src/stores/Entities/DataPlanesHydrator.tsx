import type { BaseComponentProps } from 'src/types';

import { FormattedMessage } from 'react-intl';

import FullPageError from 'src/components/fullPage/Error';
import { useHydrateDataPlanesState } from 'src/stores/Entities/hooks';

export const DataPlanesHydrator = ({ children }: BaseComponentProps) => {
    // Start fetching the prefixes the user has access to
    const { error } = useHydrateDataPlanesState();

    if (error) {
        return (
            <FullPageError
                error={error}
                message={
                    <FormattedMessage id="dataPlanesHydrator.error.failedToFetch" />
                }
            />
        );
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};
