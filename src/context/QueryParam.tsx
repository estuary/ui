import { BaseComponentProps } from 'types';
import { QueryParamProvider as UseQueryParamsHookProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';

// WARNING - enableBatching is not 100% yet as the author warns
//      so if there is anything weird happening with the query params
//      start by looking there
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
