import { DirectiveStates } from 'directives/types';

export interface RegistrationProgressProps {
    status: DirectiveStates;
    step: number;
    loading?: boolean;
}
