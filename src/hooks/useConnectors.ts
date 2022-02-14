import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

type ConnectorsService = {
    isFetchingConnectors: boolean;
    connectors: any;
    fetchingConnectorsError: any;
    fetchConnectors: any;
};

const useConnectors = (): ConnectorsService => {
    const [connectors, setConnectors] = useState<object[]>([]);
    const [fetchingConnectorsError, setError] = useState<string | null>(null);
    const [isFetchingConnectors, setIsFetching] = useState<boolean>(true);

    const fetchConnectors = useCallback(async () => {
        setIsFetching(true);
        setError(null);
        axios
            .get(`http://localhost:3009/connectors`)
            .then((response) => {
                setConnectors(response.data.data);
            })
            .catch((error) => {
                setError(
                    error.response ? error.response.data.message : error.message
                );
            })
            .finally(() => {
                setIsFetching(false);
            });
    }, []);

    useEffect(() => {
        (async () => {
            await fetchConnectors();
        })();
    }, [fetchConnectors]);

    return {
        isFetchingConnectors,
        connectors,
        fetchingConnectorsError,
        fetchConnectors,
    };
};

export default useConnectors;
