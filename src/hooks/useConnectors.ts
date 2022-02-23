import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'services/axios';
import { useAuth } from '../auth/Context';

type ConnectorsService = {
    isFetchingConnectors: boolean;
    connectors: ConnectorsResponse[];
    fetchingConnectorsError: string | null;
    fetchConnectors: any;
};

type ConnectorsResponse = {
    attributes: {
        name: string;
        description: string;
        maintainer: string;
        type: string;
        updated_at: Date;
    };
    links: {
        images: string;
    };
};

const useConnectors = (): ConnectorsService => {
    const [connectors, setConnectors] = useState<ConnectorsResponse[]>([]);
    const [fetchingConnectorsError, setError] = useState<string | null>(null);
    const [isFetchingConnectors, setIsFetching] = useState<boolean>(true);

    const navigate = useNavigate();
    const auth = useAuth();

    const fetchConnectors = useCallback(async () => {
        setIsFetching(true);
        setError(null);
        axios
            .get(`/connectors`)
            .then((response) => {
                if (response.data.redirect) {
                    auth.signout(() => {
                        navigate('/login', { replace: true });
                    });
                } else {
                    setConnectors(response.data.data);
                }
            })
            .catch((error) => {
                setError(
                    error.response ? error.response.data.message : error.message
                );
            })
            .finally(() => {
                setIsFetching(false);
            });
    }, [auth, navigate]);

    useEffect(() => {
        void (async () => {
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
