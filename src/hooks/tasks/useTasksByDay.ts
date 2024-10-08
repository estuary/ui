import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { supabaseClient } from 'context/GlobalProviders';
import { TABLES } from 'services/supabase';
import { Entity, Shard } from 'types';

export interface Out {
    bytesTotal: number;
    docsTotal: number;
}

interface CaptureDetails {
    out: Out;
    right: Out;
}

export interface TaskFlowDocument {
    capture: {
        [k: string]: CaptureDetails;
    };
    openSecondsTotal: number;
    shard: Shard;
    ts: Date;
    txnCount: number;
}

export interface TasksByDayQuery {
    name: string;
    ts: Date;
    kind: Entity;
    flow_document: TaskFlowDocument;
}

const TASK_BY_DAY_COLS = ['name', 'ts', 'kind', 'flow_document'];
const TASK_BY_DAY_QUERY = TASK_BY_DAY_COLS.join(', ');

function useTasksByDay(name: string | null, kind: Entity | null) {
    const { data, error, mutate, isValidating } = useQuery(
        name && kind
            ? supabaseClient
                  .from(TABLES.TASKS_BY_DAY)
                  .select(TASK_BY_DAY_QUERY)
                  .eq('name', name)
                  .eq('kind', kind as string)
                  .returns<TasksByDayQuery[]>()
            : null
    );

    return {
        tasksStats: data ?? [],
        error,
        mutate,
        isValidating,
    };
}

export default useTasksByDay;
