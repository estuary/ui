import { insertSupabase, TABLES } from 'services/supabase';
import { Capability } from 'types';

export const createRoleGrant = (
    subject_role: string,
    object_role: string,
    capability: Capability
) => {
    return insertSupabase(TABLES.ROLE_GRANTS, {
        subject_role,
        object_role,
        capability,
        detail: 'Applied via UI',
    });
};
