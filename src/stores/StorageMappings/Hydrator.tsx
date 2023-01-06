import { useEffect } from 'react';
import { BaseComponentProps } from 'types';
import { useStorageMappingsStore_hydrate } from './hooks';

export const StorageMappingsHydrator = ({ children }: BaseComponentProps) => {
    const hydrate = useStorageMappingsStore_hydrate();

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default StorageMappingsHydrator;
