import { insertSupabase, supabaseClient, TABLES } from 'services/supabase';
import { BaseGrant, Capability } from 'types';

const createRoleGrant = (
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

const getPrefixAdministrators = (
    objectRole: string,
    capability: Capability
) => {
    return supabaseClient
        .from<BaseGrant>(TABLES.ROLE_GRANTS)
        .select(`capability, object_role, subject_role`)
        .eq('capability', capability)
        .eq('object_role', objectRole);
};

export { createRoleGrant, getPrefixAdministrators };
