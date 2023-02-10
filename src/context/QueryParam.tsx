import { BaseComponentProps } from 'types';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';

function QueryParam({ children }: BaseComponentProps) {
    return (
        <QueryParamProvider
            adapter={ReactRouter6Adapter}
            options={{
                enableBatching: true,
                updateType: 'replaceIn',
            }}
        >
            {children}
        </QueryParamProvider>
    );
}

export default QueryParam;
