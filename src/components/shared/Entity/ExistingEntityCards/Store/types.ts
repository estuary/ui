import {
    CaptureQueryWithSpec,
    MaterializationQueryWithSpec,
} from 'api/liveSpecsExt';
import { StoreWithHydration } from 'stores/Hydration';
import { EntityWithCreateWorkflow } from 'types';

export interface ExistingEntityState extends StoreWithHydration {
    connectorName: string | null;
    createNewTask: boolean;

    hydrateState: (
        entityType: EntityWithCreateWorkflow,
        connectorId: string
    ) => Promise<void>;
    queryData: CaptureQueryWithSpec[] | MaterializationQueryWithSpec[] | null;

    resetState: () => void;
    setConnectorName: (value: ExistingEntityState['connectorName']) => void;

    setCreateNewTask: (value: ExistingEntityState['createNewTask']) => void;

    setQueryData: (value: ExistingEntityState['queryData']) => void;
}
