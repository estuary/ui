import { Capability } from 'types';

import { insertSupabase, TABLES } from 'services/supabase';

export const createRoleGrant = (
    subject_role: string,
    object_role: string,
    capability: Capability
) => {
    return insertSupabase(TABLES.ROLE_GRANTS, {
        subject_role,
        object_role,
        capability,
    });
};
