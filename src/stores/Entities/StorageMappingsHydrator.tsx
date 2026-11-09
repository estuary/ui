import type { BaseComponentProps } from 'src/types';

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
                    <>
                        There was an issue while checking if you have any
                        storage mappings.
                    </>
                }
            />
        );
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};
