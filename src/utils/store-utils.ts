import { devtools } from 'zustand/middleware';

// TODO - add in Immer middleware
// https://github.com/pmndrs/zustand#middleware
// https://github.com/pmndrs/zustand/blob/main/tests/middlewareTypes.test.tsx

export const devtoolsInNonProd = (process.env.NODE_ENV === 'production'
    ? (fn: any) => fn
    : devtools) as unknown as typeof devtools;
