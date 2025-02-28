import { useUserStore } from 'context/User/useUserContextStore';
import { useCallback } from 'react';
import { ESTUARY_SUPPORT_ROLE } from 'utils/misc-utils';
import { useShallow } from 'zustand/react/shallow';

export type AccessGrantRemovalType = 'dangerous' | 'normal';

export type AccessGrantRemovalDescription =
    | [AccessGrantRemovalType, string]
    | undefined;

function useAccessGrantRemovalDescriptions() {
    const userEmail = useUserStore(
        useShallow((state) => state.userDetails?.email)
    );

    const describeDangerousRemovals = useCallback(
        (value: any): AccessGrantRemovalDescription => {
            const removalType: AccessGrantRemovalType = 'dangerous';

            const updatingTenantLevelSharing = Boolean(value.subject_role);

            if (value.object_role === 'ops/dp/public/') {
                return [
                    removalType,
                    `The tenant's will not be able to write to the public dataplane.`,
                ];
            }

            if (value.capability === 'admin') {
                if (updatingTenantLevelSharing) {
                    if (value.subject_role === value.object_role) {
                        return [
                            removalType,
                            `The tenant will not be able to administrate itself.`,
                        ];
                    }
                }

                if (userEmail && value.user_email === userEmail) {
                    return [
                        removalType,
                        'You will no longer have admin access to this tenant. Creating entities, adding/removing users, managing settings, and more could all be impacted.',
                    ];
                }
            }

            if (value.capability === 'write') {
                if (updatingTenantLevelSharing) {
                    if (value.subject_role === value.object_role) {
                        return [
                            removalType,
                            `The tenant will not be able to write anything to itself. Captures could fail.`,
                        ];
                    }
                }

                if (userEmail && value.user_email === userEmail) {
                    return [
                        removalType,
                        'You will not be able to create new entities in this tenant.',
                    ];
                }
            }

            if (value.capability === 'read') {
                if (updatingTenantLevelSharing) {
                    if (value.subject_role === value.object_role) {
                        return [
                            removalType,
                            `The tenant will not be able to read from itself. Materializations could fail.`,
                        ];
                    }
                }

                if (userEmail && value.user_email === userEmail) {
                    return [
                        removalType,
                        'You will not be able to see anything in the tenant.',
                    ];
                }
            }

            return undefined;
        },
        [userEmail]
    );

    const describeNormalRemovals = useCallback(
        (value: any): AccessGrantRemovalDescription => {
            const removalType: AccessGrantRemovalType = 'normal';

            const updatingTenantLevelSharing = Boolean(value.subject_role);

            if (value.capability === 'admin') {
                if (updatingTenantLevelSharing) {
                    if (value.subject_role === ESTUARY_SUPPORT_ROLE) {
                        return [
                            removalType,
                            `Estuary Support staff will no longer be able to help manage the tenant.`,
                        ];
                    }

                    if (value.subject_role !== value.object_role) {
                        return [
                            removalType,
                            `This will remove one tenant's ability to manage another tenant.`,
                        ];
                    }
                }

                if (value.user_email) {
                    return [
                        removalType,
                        `This will remove a user's admin access to a tenant.`,
                    ];
                }
            }

            if (value.capability === 'write') {
                if (updatingTenantLevelSharing) {
                    if (value.subject_role !== value.object_role) {
                        return [
                            removalType,
                            `This will remove one tenant's ability to write another tenant.`,
                        ];
                    }
                }

                if (value.user_email) {
                    return [
                        removalType,
                        `This will remove a user's admin access to a tenant.`,
                    ];
                }
            }

            if (value.capability === 'read') {
                if (updatingTenantLevelSharing) {
                    if (value.subject_role !== value.object_role) {
                        return [
                            removalType,
                            `This will remove one tenant's ability to read from another tenant.`,
                        ];
                    }
                }

                if (value.user_email) {
                    return [
                        removalType,
                        `This will remove a user's admin access to a tenant.`,
                    ];
                }
            }

            return undefined;
        },
        []
    );

    const describeAllRemovals = useCallback(
        (value: any): AccessGrantRemovalDescription => {
            const dangerousDescription = describeDangerousRemovals(value);
            if (dangerousDescription) {
                return dangerousDescription;
            }

            const normalDescription = describeNormalRemovals(value);

            if (normalDescription) {
                return normalDescription;
            }

            return undefined;
        },
        [describeDangerousRemovals, describeNormalRemovals]
    );

    return {
        describeAllRemovals,
        describeDangerousRemovals,
        describeNormalRemovals,
    };
}

export default useAccessGrantRemovalDescriptions;
