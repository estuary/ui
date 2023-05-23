import { AuthRoles, Schema } from 'types';

interface PrefixProps {
    [key: string]: {
        token?: string;
    };
}

export interface EntitiesState {
    // Storing what the user has access to
    setCapabilities: (capabilities: AuthRoles[] | null) => void;

    prefixes: {
        admin: PrefixProps | Schema | {};
        read: PrefixProps | Schema | {};
        write: PrefixProps | Schema | {};
    };

    hydrateState: () => Promise<void>;
    hydrated: boolean;
    hydrationErrors: any;
    setHydrated: (val: EntitiesState['hydrated']) => void;
    resetState: () => void;
}
