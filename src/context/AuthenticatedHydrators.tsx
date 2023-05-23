import { EntitiesHydrator } from 'stores/Entities/Hydrator';
import { BaseComponentProps } from 'types';

function AuthenticatedHydrators({ children }: BaseComponentProps) {
    return <EntitiesHydrator>{children}</EntitiesHydrator>;
}

export default AuthenticatedHydrators;
