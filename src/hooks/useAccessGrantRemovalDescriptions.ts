import { useUserStore } from 'context/User/useUserContextStore';
import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';
import { BaseGrant, Grant_UserExt } from 'types';
import { ESTUARY_SUPPORT_ROLE, isGrant_UserExt } from 'utils/misc-utils';
import { useShallow } from 'zustand/react/shallow';

type GrantScopeMessageIdSuffix =
    | 'finalEmail'
    | 'email'
    | 'ownEmail'
    | 'ownTenant'
    | 'support'
    | 'tenant';

export type AccessGrantRemovalType = 'dangerous' | 'normal';

export type AccessGrantRemovalDescription = [AccessGrantRemovalType, string];

function useAccessGrantRemovalDescriptions() {
    const intl = useIntl();
    const userEmail = useUserStore(
        useShallow((state) => state.userDetails?.email)
    );

    const adminable = useEntitiesStore_capabilities_adminable();

    const probablyNewUser = useMemo(() => adminable.length === 1, [adminable]);

    console.log('adminable', adminable);

    const describeAccessGrantRemovals = useCallback(
        (value: Grant_UserExt | BaseGrant): AccessGrantRemovalDescription => {
            console.log('describeAccessGrantRemovals', value);

            let what: string | null = value.capability;
            let removalType: AccessGrantRemovalType = 'normal';
            let grantScope: GrantScopeMessageIdSuffix;

            // Figure out what the of the grant is
            if (isGrant_UserExt(value)) {
                if (value.user_email === userEmail) {
                    if (probablyNewUser) {
                        grantScope = 'finalEmail';
                    } else {
                        grantScope = 'ownEmail';
                    }
                } else {
                    grantScope = 'email';
                }
            } else if (value.subject_role === value.object_role) {
                grantScope = 'ownTenant';
            } else if (value.subject_role === ESTUARY_SUPPORT_ROLE) {
                grantScope = 'support';
            } else {
                grantScope = 'tenant';
            }

            // Some things are dangerous so mark those
            if (
                grantScope === 'ownEmail' || // Removing their own email - but they have access to other stuff
                grantScope === 'finalEmail' // Removing their only access - and will be logged out right away
            ) {
                removalType = 'dangerous';
            } else if (value.object_role === 'ops/dp/public/') {
                // Removing any access to public dataplane
                removalType = 'dangerous';
                what = 'dataPlane';
            } else if (grantScope === 'ownTenant') {
                // Removing some access a tenant has to ITSELF
                removalType = 'dangerous';
            } else if (grantScope === 'support') {
                removalType = 'dangerous';
            }

            return [
                removalType,
                intl.formatMessage({
                    id: `accessGrants.descriptions.removing.${what}.${grantScope}`,
                }),
            ];
        },
        [intl, probablyNewUser, userEmail]
    );

    return {
        describeAllRemovals: describeAccessGrantRemovals,
    };
}

export default useAccessGrantRemovalDescriptions;
