import type { BaseGrant, Grant_UserExt } from 'src/types';

import { useCallback, useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { useIntl } from 'react-intl';

import { useUserStore } from 'src/context/User/useUserContextStore';
import {
    useEntitiesStore_capabilities_adminable,
    useEntitiesStore_capabilities_readable,
} from 'src/stores/Entities/hooks';
import { ESTUARY_SUPPORT_ROLE, isGrant_UserExt } from 'src/utils/misc-utils';

type GrantScopeMessageIdSuffix =
    | 'finalEmail'
    | 'email'
    | 'ownEmail'
    | 'ownTenant'
    | 'support'
    | 'tenant';

export type AccessGrantRemovalSeverity = 'dangerous' | 'normal';

export type AccessGrantRemovalDescription = [
    AccessGrantRemovalSeverity,
    string,
];

function useAccessGrantRemovalDescriptions() {
    const intl = useIntl();
    const userEmail = useUserStore(
        useShallow((state) => state.userDetails?.email)
    );

    const adminable = useEntitiesStore_capabilities_adminable();
    const readable = useEntitiesStore_capabilities_readable();
    const singleAdmin = useMemo(() => adminable.length === 1, [adminable]);
    const singleReadable = useMemo(() => readable.length === 1, [readable]);

    const describeAccessGrantRemovals = useCallback(
        (value: Grant_UserExt | BaseGrant): AccessGrantRemovalDescription => {
            let target: string | null = value.capability;
            let removalType: AccessGrantRemovalSeverity = 'normal';
            let grantScope: GrantScopeMessageIdSuffix;

            // Figure out what the of the grant is
            if (isGrant_UserExt(value)) {
                if (value.user_email === userEmail) {
                    if (
                        (singleAdmin && target === 'admin') ||
                        (singleReadable && target === 'read')
                    ) {
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
                grantScope === 'finalEmail' // Removing their only access - and might have to enter a new tenant
            ) {
                removalType = 'dangerous';
            } else if (value.object_role === 'ops/dp/public/') {
                // Removing any access to public dataplane
                removalType = 'dangerous';
                target = 'dataPlane';
            } else if (grantScope === 'ownTenant') {
                // Removing some access a tenant has to ITSELF
                removalType = 'dangerous';
            } else if (grantScope === 'support') {
                // Removing support can just make life hard on user
                removalType = 'dangerous';
            }

            return [
                removalType,
                intl.formatMessage({
                    id: `accessGrants.descriptions.removing.${target}.${grantScope}`,
                }),
            ];
        },
        [intl, singleAdmin, singleReadable, userEmail]
    );

    return {
        describeAllRemovals: describeAccessGrantRemovals,
    };
}

export default useAccessGrantRemovalDescriptions;
