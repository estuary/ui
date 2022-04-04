import { useAsyncHandler } from 'hooks/useAsyncHandler';
import { isEmpty } from 'lodash';
import { useCallback, useEffect } from 'react';
import { supabase } from 'services/supabase';

function useSupabase(query: (params?: any) => any, queryParams?: any) {
    const asyncParams = useAsyncHandler<any[] | any>();
    const { run } = asyncParams;

    const runner = useCallback(() => {
        return query(queryParams).then(
            async (response: any) => {
                if (response.status === 401) {
                    await supabase.auth.signOut();
                    return Promise.reject({
                        message: 'common.loggedOut',
                    });
                } else if (!isEmpty(response.error)) {
                    return Promise.reject(response.error);
                } else {
                    return Promise.resolve(response.data);
                }
            },
            (error: any) => {
                console.log('Supabase call failed!!!', error);
                return Promise.reject(error);
            }
        );
    }, [query, queryParams]);

    useEffect(() => {
        run(runner());
    }, [run, runner]);

    return asyncParams;
}

export default useSupabase;
