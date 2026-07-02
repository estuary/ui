import type { AlertConfigResponse } from 'src/components/admin/Settings/PrefixAlerts/types';
import type { AlertConfigMutationInput } from 'src/types/gql';

import { useCallback } from 'react';

import { useMutation } from 'urql';

import { AlertConfigUpdateMutation } from 'src/api/alerts';
import { logRocketEvent } from 'src/services/shared';

export function useUpsertAlertConfig() {
    const [upsertConfigResult, mutateUpsertConfig] = useMutation(
        AlertConfigUpdateMutation
    );

    const upsertConfig = useCallback(
        async ({
            catalogPrefixOrName,
            config,
            detail,
        }: AlertConfigMutationInput): Promise<AlertConfigResponse> => {
            return mutateUpsertConfig({
                catalogPrefixOrName,
                config,
                detail,
            }).then(
                (response) => {
                    if (response?.error) {
                        logRocketEvent('AlertConfig', {
                            errorResponse: response.error,
                            operation: 'upsert',
                            variables: response.operation.variables,
                        });

                        const { catalogPrefixOrName: responseVariablePrefix } =
                            response.operation.variables;

                        return Promise.resolve({
                            error: response.error,
                            invalid: true,
                            prefix: responseVariablePrefix,
                        });
                    }

                    if (!response || !response?.data) {
                        logRocketEvent('AlertConfig', {
                            missingResponseData: !response.data,
                            operation: 'upsert',
                            variables: response.operation.variables,
                        });

                        const { catalogPrefixOrName: responseVariablePrefix } =
                            response.operation.variables;

                        return Promise.resolve({
                            invalid: true,
                            prefix: responseVariablePrefix,
                        });
                    }

                    const { catalogPrefixOrName: responsePrefix } =
                        response.data;

                    return Promise.resolve({
                        prefix: responsePrefix,
                    });
                },
                () => {
                    logRocketEvent('AlertConfig', {
                        operation: 'upsert',
                        promiseRejected: 'explicit',
                    });

                    return Promise.reject();
                }
            );
        },
        [mutateUpsertConfig]
    );

    return {
        upsertConfig,
        upsertConfigResult,
    };
}
