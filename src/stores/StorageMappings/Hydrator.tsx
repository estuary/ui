import { useEffect } from 'react';
import { BaseComponentProps } from 'types';
import { useStorageMappingsStore } from './Store';

export const StorageMappingsHydrator = ({ children }: BaseComponentProps) => {
    const hydrate = useStorageMappingsStore((state) => state.hydrate);

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default StorageMappingsHydrator;
