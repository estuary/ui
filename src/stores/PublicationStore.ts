import { devtoolsInNonProd } from 'utils/store-utils';
import create from 'zustand';
import { persist } from 'zustand/middleware';

export type DeploymentStatus = 'ACTIVE' | 'INACTIVE';

export interface EntityMetadata {
    deploymentStatus: DeploymentStatus;
    name: string;
    catalogNamespace: string;
    connectorType: string;
    dateCreated: string;
}

export interface Entity<T = any> {
    metadata: EntityMetadata;
    resources: T;
}

interface EntityDictionary<T = any> {
    [key: string]: Entity<T>;
}

export interface PublicationState<T = any> {
    captures: EntityDictionary;
    addCapture: (key: string, newCapture: Entity<T>) => void;
    updateDeploymentStatus: (
        key: string,
        deploymentStatus: DeploymentStatus
    ) => void;
    newChangeCount: number;
    resetNewChangeCount: () => void;
}

const name = 'publication-state';

// TODO: Look into a better way to hydrate the state.
const usePublicationStore = create<PublicationState>(
    devtoolsInNonProd(
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
                        'Publications Viewed'
                    ),
            }),
            { name }
        ),
        { name }
    )
);

export default usePublicationStore;
