import type { PostgrestSingleResponse } from '@supabase/postgrest-js';
import type { UserClaims } from 'src/directives/types';
import type { CallSupabaseResponse, SortingProps } from 'src/services/supabase';
import type {
    AppliedDirective,
    Directive,
    GrantDirective,
    GrantDirective_AccessLinks,
    GrantDirectiveSpec,
    JoinedAppliedDirective,
    Schema,
} from 'src/types';

import { supabaseClient } from 'src/context/GlobalProviders';
import { DIRECTIVES } from 'src/directives/shared';
import { logRocketConsole } from 'src/services/shared';
import {
    defaultTableFilter,
    handleFailure,
    handleSuccess,
    insertSupabase,
    RPCS,
    supabaseRetry,
    TABLES,
    updateSupabase,
} from 'src/services/supabase';

interface GrantDirective_CreateMatchData {
    catalog_prefix: string;
    spec: GrantDirectiveSpec;
    uses_remaining?: number | null;
}

export interface ExchangeResponse {
    directive: Directive | null; // Only null so we can "fake" this response below
    applied_directive: AppliedDirective<UserClaims>;
}

const generateMatchData = (data: ExchangeResponse['applied_directive']) => {
    return {
        id: data.id,
        logs_token: data.logs_token,
        directive_id: data.directive_id,
        user_id: data.user_id,
    };
};

const callUpdate = (
    user_claims: Schema,
    response: ExchangeResponse['applied_directive']
) => {
    return updateSupabase(
        TABLES.APPLIED_DIRECTIVES,
        {
            user_claims,
        },
        generateMatchData(response)
    );
};

const exchangeBearerToken = async (token: string) => {
    logRocketConsole('directives:exchangeBearerToken');
    return supabaseRetry<PostgrestSingleResponse<ExchangeResponse>>(
        () =>
            supabaseClient
                .rpc(RPCS.EXCHANGE_DIRECTIVES, {
                    bearer_token: token,
                })
                .single(),
        'exchangeBearerToken'
    );
};

const submitDirective = async (
    type: keyof typeof DIRECTIVES,
    existingDirective?: AppliedDirective<UserClaims>,
    ...dataForClaim: any[]
) => {
    let data: ExchangeResponse | null, error;
    if (!existingDirective) {
        try {
            const response = await exchangeBearerToken(DIRECTIVES[type].token);
            data = response.data;
            error = response.error;
        } catch (e: unknown) {
            data = null;
            error = e;
        }
    } else {
        data = { directive: null, applied_directive: existingDirective };
    }

    if (error || !data) {
        console.error('error', error);
        return { data: [], error };
    } else {
        logRocketConsole('submitDirective:callUpdate');
        return callUpdate(
            DIRECTIVES[type].generateUserClaim(dataForClaim),
            data.applied_directive
        );
    }
};

const getAppliedDirectives = (
    type: keyof typeof DIRECTIVES,
    token?: string
) => {
    let queryBuilder = supabaseClient
        .from(TABLES.APPLIED_DIRECTIVES)
        .select(
            `
            id,
            directive_id,
            job_status,
            logs_token,
            user_id,
            user_claims,
            updated_at,
            directives !inner(uses_remaining, spec->>type)
        `
        )
        .eq('directives.spec->>type', type);

    if (token) {
        queryBuilder = queryBuilder.eq('directives.token', token);
    }

    return DIRECTIVES[type]
        .queryFilter(queryBuilder)
        .order('updated_at', { ascending: false })
        .limit(1)
        .returns<JoinedAppliedDirective[]>();
};

const generateGrantDirective = (
    prefix: string,
    capability: string,
    singleUse?: boolean
): PromiseLike<CallSupabaseResponse<GrantDirective[]>> => {
    let data: GrantDirective_CreateMatchData = {
        catalog_prefix: prefix,
        spec: {
            type: 'grant',
            grantedPrefix: prefix,
            capability,
        },
    };

    if (singleUse) {
        data = { ...data, uses_remaining: 1 };
    }
    return insertSupabase(TABLES.DIRECTIVES, data);
};

const getDirectiveByToken = async (token: string) => {
    const data = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.DIRECTIVES)
                .select(`spec,token`)
                .eq('token', token),
        'getDirectiveByToken'
    ).then(
        handleSuccess<Pick<GrantDirective, 'spec' | 'token'>[]>,
        handleFailure
    );

    return data;
};

// Used in table hydrator which handles the retrying
const getDirectivesByType = (
    directiveType: keyof typeof DIRECTIVES,
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    return defaultTableFilter<GrantDirective_AccessLinks>(
        supabaseClient
            .from(TABLES.DIRECTIVES)
            .select(`id,catalog_prefix,uses_remaining,spec,token,updated_at`, {
                count: 'exact',
            })
            .eq('spec->>type', directiveType)
            .or(`uses_remaining.gt.0,uses_remaining.is.null`),
        ['catalog_prefix', `spec->>capability`, `spec->>grantedPrefix`],
        searchQuery,
        sorting,
        pagination
    );
};

const disableDirective = (directiveId: string) => {
    return updateSupabase(
        TABLES.DIRECTIVES,
        { uses_remaining: 0 },
        { id: directiveId }
    );
};

export {
    disableDirective,
    exchangeBearerToken,
    generateGrantDirective,
    getAppliedDirectives,
    getDirectivesByType,
    getDirectiveByToken,
    submitDirective,
};
