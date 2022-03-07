import { accountsEndpoint, AccountsResponse } from 'entities/accounts';
import { useAsync, UseAsyncResponse } from 'hooks/useAsync';
import { useEffect } from 'react';

function useAccounts(): UseAsyncResponse<AccountsResponse> {
    const response = useAsync<AccountsResponse>();
    const { run } = response;

    useEffect(() => {
        run(accountsEndpoint.read());
    }, [run]);

    return response;
}

export default useAccounts;
