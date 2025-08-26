import type { BaseComponentProps } from 'src/types';

import { FormattedMessage } from 'react-intl';

import FullPageError from 'src/components/fullPage/Error';
import { useStorageMappingsHydrator } from 'src/stores/Entities/hooks';

export const StorageMappingsHydrator = ({ children }: BaseComponentProps) => {
    // Start fetching the prefixes the user has access to
    const { error } = useStorageMappingsHydrator();

    if (error) {
        return (
            <FullPageError
                error={error}
                message={
                    <FormattedMessage id="storageMappingsHydrator.error.failedToFetch" />
                }
            />
        );
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};
