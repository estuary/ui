import { ReactNode } from 'react';

import { StoreName } from 'src/stores/names';

export type UseZustandStore = <S extends Object, U>(
    storeName: StoreName,
    selector: (state: S) => U,
    equalityFn?: any
) => U;

export interface ZustandProviderProps {
    children: ReactNode;
}
