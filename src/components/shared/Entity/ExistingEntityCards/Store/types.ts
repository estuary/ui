import {
    CaptureQueryWithSpec,
    MaterializationQueryWithSpec,
} from 'api/liveSpecsExt';
import { StoreWithHydration } from 'stores/Hydration';
import { EntityWithCreateWorkflow } from 'types';

export interface ExistingEntityState extends StoreWithHydration {
    queryData: CaptureQueryWithSpec[] | MaterializationQueryWithSpec[] | null;
    setQueryData: (value: ExistingEntityState['queryData']) => void;

    createNewTask: boolean;
    setCreateNewTask: (value: ExistingEntityState['createNewTask']) => void;

    hydrateState: (entityType: EntityWithCreateWorkflow) => Promise<void>;

    resetState: () => void;
}
