import { supabaseClient } from 'context/GlobalProviders';
import { deleteSupabase, insertSupabase, TABLES } from 'services/supabase';
import type { BaseGrant, Capability } from 'types';

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

const deleteRoleGrant = (id: string) => {
    return deleteSupabase(TABLES.ROLE_GRANTS, {
        id,
    });
};

const getPrefixAdministrators = (
    objectRole: string,
    capability: Capability
) => {
    return supabaseClient
        .from(TABLES.ROLE_GRANTS)
        .select(`capability, object_role, subject_role`)
        .eq('capability', capability)
        .eq('object_role', objectRole)
        .returns<BaseGrant[]>();
};

export { createRoleGrant, deleteRoleGrant, getPrefixAdministrators };
