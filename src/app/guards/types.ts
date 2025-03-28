import type { DirectiveStates } from 'src/directives/types';

export interface RegistrationProgressProps {
    status: DirectiveStates;
    step: 1 | 2;
    loading?: boolean;
}
