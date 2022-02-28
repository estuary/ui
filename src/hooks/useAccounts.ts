import axios, { AxiosResponse } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { withAxios } from '../services/axios';
import { AccountsResponse, BaseHook } from '../types';

interface AccountsService extends BaseHook {
    data: {
        accounts: AccountsResponse['data'];
    };
}

function useAccounts() {
    const [accounts, setAccounts] = useState<
        AccountsService['data']['accounts']
    >([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchConnectors = useCallback(async () => {
        setLoading(true);
        setError(null);
        withAxios(axios.get('/accounts'), setError, setLoading)
            .then((response: AxiosResponse<AccountsResponse>) => {
                setAccounts(response.data.data);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        void (async () => {
            await fetchConnectors();
        })();
    }, [fetchConnectors]);

    return {
        data: { accounts },
        error,
        loading,
    };
}

export default useAccounts;
