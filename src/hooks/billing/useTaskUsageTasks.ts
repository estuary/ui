import type { TaskUsageSpecsQuery } from 'src/gql-types/graphql';

import { useMemo } from 'react';

import { TASK_USAGE_SPECS_QUERY } from 'src/api/gql/billingUsage';
import { useAllPages } from 'src/api/gql/useAllPages';

export type TaskKind = 'capture' | 'materialization' | 'derivation';

export interface UsageTask {
    name: string;
    kind: TaskKind;
    disabled: boolean;
}

type SpecNode = TaskUsageSpecsQuery['liveSpecs']['edges'][number]['node'];

const toUsageTask = ({ catalogName, liveSpec }: SpecNode): UsageTask | null => {
    switch (liveSpec?.catalogType) {
        case 'capture':
        case 'materialization':
            return {
                name: catalogName,
                kind: liveSpec.catalogType,
                disabled: liveSpec.isDisabled,
            };
        case 'collection':
            return liveSpec.readsFrom
                ? {
                      name: catalogName,
                      kind: 'derivation',
                      disabled: liveSpec.isDisabled,
                  }
                : null;
        default:
            return null;
    }
};

// Every task under the tenant that can be billed for usage: captures,
// materializations and derivations.
export function useTaskUsageTasks(tenant: string) {
    const { data, loading, error } = useAllPages(TASK_USAGE_SPECS_QUERY, {
        variables: { prefix: tenant },
        getConnection: (result) => result.liveSpecs,
        transform: toUsageTask,
    });

    const tasks = useMemo(
        () => data.filter((task): task is UsageTask => task !== null),
        [data]
    );

    return { tasks, loading, error };
}
