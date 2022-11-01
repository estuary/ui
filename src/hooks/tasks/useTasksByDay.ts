import { TABLES } from 'services/supabase';
import { Entity } from 'types';
import { useQuery, useSelect } from '../supabase-swr/';

export interface Meta {
    uuid: string;
}

export interface Out {
    bytesTotal: number;
    docsTotal: number;
}

export interface Shard {
    keyBegin: string;
    kind: string;
    name: string;
    rClockBegin: string;
}

interface CaptureDetails {
    out: Out;
    right: Out;
}

export interface TaskFlowDocument {
    _meta: Meta;
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
    const taskByDayQuery = useQuery<TasksByDayQuery>(
        TABLES.TASKS_BY_DAY,
        {
            columns: TASK_BY_DAY_QUERY,
            filter: (query) =>
                query.eq('name', name as string).eq('kind', kind as string),
        },
        [name, kind]
    );

    const { data, error, mutate, isValidating } = useSelect(
        name && kind ? taskByDayQuery : null
    );

    return {
        tasksStats: data ? data.data : [],
        error,
        mutate,
        isValidating,
    };
}

export default useTasksByDay;
