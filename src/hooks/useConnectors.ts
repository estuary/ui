import { useAsyncHandler } from 'hooks/useAsyncHandler';
import { useEffect } from 'react';
import { callSupabase, supabase } from 'services/supabase';

function useConnectors() {
    const response = useAsyncHandler<any[]>();
    const { run } = response;

    useEffect(() => {
        run(
            callSupabase(
                supabase
                    .from('connectors')
                    .select(`detail, image_name, updated_at, id`)
                    .order('updated_at', {
                        ascending: false,
                    })
            ).then(({ data }: { data: any }) => {
                return Promise.resolve(data);
            })
        );
    }, [run]);

    return response;
}

export default useConnectors;
