import type { MutableRefObject } from 'react';
import type { DirectiveStates } from 'src/directives/types';
import type { BaseComponentProps } from 'src/types';

export interface ExpressWorkflowGuardProps extends BaseComponentProps {
    authenticating: MutableRefObject<boolean>;
}

export interface RegistrationProgressProps {
    status: DirectiveStates;
    step: 1 | 2;
    loading?: boolean;
}
