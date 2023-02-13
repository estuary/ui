import { BaseComponentProps } from 'types';
import { QueryParamProvider as UseQueryParamsHookProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';

function QueryParamProvider({ children }: BaseComponentProps) {
    return (
        <UseQueryParamsHookProvider
            adapter={ReactRouter6Adapter}
            options={{
                enableBatching: true,
                updateType: 'replaceIn',
            }}
        >
            {children}
        </UseQueryParamsHookProvider>
    );
}

export default QueryParamProvider;
