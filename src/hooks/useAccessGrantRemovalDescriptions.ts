import { useUserStore } from 'context/User/useUserContextStore';
import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';
import { BaseGrant, Grant_UserExt } from 'types';
import { ESTUARY_SUPPORT_ROLE, isGrant_UserExt } from 'utils/misc-utils';
import { useShallow } from 'zustand/react/shallow';

type MessageIdWhereVals =
    | 'finalEmail'
    | 'email'
    | 'ownEmail'
    | 'ownTenant'
    | 'support'
    | 'tenant';

export type AccessGrantRemovalType = 'dangerous' | 'normal';

export type AccessGrantRemovalDescription =
    | [AccessGrantRemovalType, string]
    | undefined;

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

            // Sett good initial defaults and then override down below if some more important is found
            let where: MessageIdWhereVals = isGrant_UserExt(value)
                ? userEmail
                    ? 'ownEmail'
                    : 'email'
                : 'tenant';
            let what: string | null = value.capability;
            let removalType: AccessGrantRemovalType = 'normal';

            if (probablyNewUser && where === 'ownEmail') {
                // Removing their only access - and will be logged out right away
                removalType = 'dangerous';
                where = 'finalEmail';
            } else if (value.object_role === 'ops/dp/public/') {
                // Removing any access to public dataplane
                removalType = 'dangerous';
                what = 'dataPlane';
                where = 'ownTenant';
            } else if (where === 'tenant') {
                if (value.subject_role === value.object_role) {
                    // Removing some access a tenant has to ITSELF
                    removalType = 'dangerous';
                    where = 'ownTenant';
                } else if (value.subject_role === ESTUARY_SUPPORT_ROLE) {
                    // Removing support from a tenant
                    where = 'support';
                }
            } else if (where === 'ownEmail') {
                // Removing their own email - but they have access to other stuff
                removalType = 'dangerous';
            }

            return [
                removalType,
                intl.formatMessage({
                    id: `accessGrants.descriptions.removing.${what}.${where}`,
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
