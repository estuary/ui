import { useAsync } from 'hooks/useAsync';
import { isEmpty } from 'lodash';
import { useEffect } from 'react';
import { supabase } from 'services/supabase';

function useSupabase(queryToRun: () => any) {
    const asyncParams = useAsync<any[]>();
    const { run } = asyncParams;

    console.log('useSupabase');

    useEffect(() => {
        run(
            queryToRun().then(async (response: any) => {
                console.log('useSupabase then');

                if (response.status === 401) {
                    await supabase.auth.signOut();
                    return Promise.reject({ message: 'common.loggedOut' });
                } else if (!isEmpty(response.error)) {
                    return Promise.reject(response.error);
                } else {
                    return Promise.resolve(response.data);
                }
            })
        );
    }, [queryToRun, run]);

    return asyncParams;
}

export default useSupabase;
