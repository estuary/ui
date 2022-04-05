import produce from 'immer';
import { devtoolsInNonProd } from 'utils/store-utils';
import create from 'zustand';

export interface SupabaseCache {
    cache: {
        [key: string]: any;
    };
    setCache: (key: string, data: any) => any;
}

const getInitialStateData = () => {
    return {
        cache: {},
    };
};

const useSupabaseCache = create<SupabaseCache>(
    devtoolsInNonProd(
        (set) => ({
            ...getInitialStateData(),
            setCache: (key, data) => {
                set(
                    produce((state) => {
                        state[key] = data;
                    }),
                    false,
                    `${key} set in Supabase cache`
                );
            },
        }),
        { name: 'supabase-cache' }
    )
);

export default useSupabaseCache;
