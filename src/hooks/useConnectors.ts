import { AxiosResponse } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import axios, { withAxios } from 'services/axios';
import { BaseHook, ConnectorsResponse } from 'types/';

interface ConnectorsService extends BaseHook {
    data: {
        connectors: ConnectorsResponse['data'];
    };
}

const useConnectors = (): Readonly<ConnectorsService> => {
    const [connectors, setConnectors] = useState<
        ConnectorsService['data']['connectors']
    >([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchConnectors = useCallback(async () => {
        setLoading(true);
        setError(null);
        withAxios(axios.get('/connectors'), setError, setLoading)
            .then((response: AxiosResponse<ConnectorsResponse>) => {
                setConnectors(response.data.data);
            })
            .catch(() => {});
    }, []);

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
