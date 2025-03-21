import { DirectiveStates } from 'directives/types';

export interface RegistrationProgressProps {
    status: DirectiveStates;
    step: 1 | 2;
    loading?: boolean;
}
