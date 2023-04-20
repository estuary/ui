import { ReactNode } from 'react';
import { StoreName } from 'stores/names';

export type UseZustandStore = <S extends Object, U>(
    storeName: StoreName,
    selector: (state: S) => U,
    equalityFn?: any
) => U;

export interface ZustandProviderProps {
    children: ReactNode;
    storeSlice?: {
        createStore: (key: string) => unknown;
        storeName: string;
    };
}
