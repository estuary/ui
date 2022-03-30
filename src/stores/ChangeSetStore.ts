import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type DeploymentStatus = 'ACTIVE' | 'INACTIVE';
type ConnectorType = 'Hello World' | 'Postgres';

export interface EntityMetadata {
    deploymentStatus: DeploymentStatus;
    name: string;
    catalogNamespace: string;
    connectorType: ConnectorType;
    dateCreated: string;
}

export interface Entity<T = any> {
    metadata: EntityMetadata;
    resources: T;
}

interface EntityDictionary<T = any> {
    [key: string]: Entity<T>;
}

export interface ChangeSetState<T = any> {
    captures: EntityDictionary;
    addCapture: (key: string, newCapture: Entity<T>) => void;
    updateDeploymentStatus: (
        key: string,
        deploymentStatus: DeploymentStatus
    ) => void;
    newChangeCount: number;
    resetNewChangeCount: () => void;
}

const name = 'change-set-state';

// TODO: Look into a better way to hydrate the state.
const useChangeSetStore = create<ChangeSetState>(
    devtools(
        persist(
            (set) => ({
                captures: {},
                addCapture: (key, newCapture) =>
                    set(
                        (state) => ({
                            captures: { ...state.captures, [key]: newCapture },
                            newChangeCount: state.newChangeCount + 1,
                        }),
                        false,
                        'New Capture Added'
                    ),
                updateDeploymentStatus: (key, deploymentStatus) =>
                    set(
                        (state) => {
                            const capture = state.captures[key];

                            capture.metadata.deploymentStatus =
                                deploymentStatus;

                            return { captures: { ...state.captures } };
                        },
                        false,
                        'Deployment Status Updated'
                    ),
                newChangeCount: 0,
                resetNewChangeCount: () =>
                    set(
                        () => ({ newChangeCount: 0 }),
                        false,
                        'Change Set Viewed'
                    ),
            }),
            { name }
        ),
        { name }
    )
);

export default useChangeSetStore;
