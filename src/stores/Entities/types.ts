import { AuthRoles, Schema } from 'types';

export interface EntitiesState {
    // Storing what the user has access to
    setCapabilities: (capabilities: AuthRoles[] | null) => void;

    prefixes: {
        admin: Schema;
        read: Schema;
        write: Schema;
    };

    hydrateState: () => Promise<void>;
    hydrated: boolean;
    hydrationErrors: any;
    setHydrated: (val: EntitiesState['hydrated']) => void;
    resetState: () => void;
}
