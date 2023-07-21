import { BaseComponentProps } from 'types';

import { EntitiesHydrator } from 'stores/Entities/Hydrator';

function AuthenticatedHydrators({ children }: BaseComponentProps) {
    return <EntitiesHydrator>{children}</EntitiesHydrator>;
}

export default AuthenticatedHydrators;
