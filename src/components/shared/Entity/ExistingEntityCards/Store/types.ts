import {
    CaptureQueryWithSpec,
    MaterializationQueryWithSpec,
} from 'api/liveSpecsExt';
import { StoreWithHydration } from 'stores/extensions/Hydration';
import { EntityWithCreateWorkflow } from 'types';

export interface ExistingEntityState extends StoreWithHydration {
    connectorName: string | null;
    setConnectorName: (value: ExistingEntityState['connectorName']) => void;

    queryData: CaptureQueryWithSpec[] | MaterializationQueryWithSpec[] | null;
    setQueryData: (value: ExistingEntityState['queryData']) => void;

    createNewTask: boolean;
    setCreateNewTask: (value: ExistingEntityState['createNewTask']) => void;

    hydrateState: (
        entityType: EntityWithCreateWorkflow,
        connectorId: string
    ) => Promise<void>;

    resetState: () => void;
}
