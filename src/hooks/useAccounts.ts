import { accountsEndpoint, AccountsResponse } from 'endpoints/accounts';
import { useAsync } from 'hooks/useAsync';
import { useEffect } from 'react';
import { BaseHookNullableData } from 'types';

function useAccounts(): BaseHookNullableData<AccountsResponse['data']> {
    const { data, error, isIdle, isLoading, run } =
        useAsync<AccountsResponse['data']>();

    useEffect(() => {
        run(
            accountsEndpoint.read().then((serverResponse) => {
                console.log('User accounts callback');

                return Promise.resolve(serverResponse);
            })
        );
    }, [run]);

    return {
        data,
        error,
        idle: isIdle,
        loading: isLoading,
    };
}

export default useAccounts;
