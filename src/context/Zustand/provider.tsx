import { createContext as createReactContext } from 'react';
import useConstant from 'use-constant';
import invariableStores from './invariableStores';
import { ZustandProviderProps } from './types';

export const ZustandContext = createReactContext<any | null>(null);

export const ZustandProvider = ({
    children,
    storeSlice,
}: ZustandProviderProps) => {
    const storeOptions = useConstant(() => {
        if (storeSlice) {
            const { storeName, createStore } = storeSlice;

            return { [storeName]: createStore };
        } else {
            return invariableStores;
        }
    });

    return (
        <ZustandContext.Provider value={storeOptions}>
            {children}
        </ZustandContext.Provider>
    );
};
