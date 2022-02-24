import { useAuth } from 'auth/Context';
import { useCallback, useEffect, useState } from 'react';
import axios, { withAxios } from 'services/axios';
import { BaseHook, ConnectorsResponse } from 'types/';

interface ConnectorsService extends BaseHook {
    data: {
        connectors: ConnectorsResponse[];
    };
}

const useConnectors = (): Readonly<ConnectorsService> => {
    const [connectors, setConnectors] = useState<ConnectorsResponse[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const auth = useAuth();

    const fetchConnectors = useCallback(async () => {
        setLoading(true);
        setError(null);
        withAxios(axios.get('/connectors'), setError, setLoading, auth)
            .then((response: any) => {
                setConnectors(response.data.data);
            })
            .catch(() => {});
    }, [auth]);

    useEffect(() => {
        void (async () => {
            await fetchConnectors();
        })();
    }, [fetchConnectors]);

    return {
        data: { connectors },
        error,
        loading,
    };
};

export default useConnectors;
