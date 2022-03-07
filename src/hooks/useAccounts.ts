import { accountsEndpoint, AccountsResponse } from 'entities/accounts';
import { useAsync } from 'hooks/useAsync';
import { useEffect } from 'react';

function useAccounts() {
    const response = useAsync<AccountsResponse>();
    const { run } = response;

    useEffect(() => {
        run(accountsEndpoint.read());
    }, [run]);

    return response;
}

export default useAccounts;
