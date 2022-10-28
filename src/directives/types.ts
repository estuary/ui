import { AppliedDirective } from 'types';

export interface ClickToAcceptClaim {
    version: Date;
}

export interface OnboardClaim {
    requestedTenant: string;
}

export type UserClaims = ClickToAcceptClaim | OnboardClaim;

export interface DirectiveSettings {
    id: string;
    token: string;
    generateUserClaim: (args: any[]) => UserClaims;
    isClaimFulfilled: (appliedDirective?: AppliedDirective) => boolean;
}
