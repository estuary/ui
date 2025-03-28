import type { ReactNode } from 'react';

import type { StoreName } from 'src/stores/names';

export type UseZustandStore = <S extends Object, U>(
    storeName: StoreName,
    selector: (state: S) => U,
    equalityFn?: any
) => U;

export interface ZustandProviderProps {
    children: ReactNode;
}
