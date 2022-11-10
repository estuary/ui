import { DIRECTIVES } from 'directives/shared';
import { UserClaims } from 'directives/types';
import {
    RPCS,
    supabaseClient,
    TABLES,
    updateSupabase,
} from 'services/supabase';
import {
    AppliedDirective,
    Directive,
    JoinedAppliedDirective,
    Schema,
} from 'types';

export interface ExchangeResponse {
    directive: Directive | null; //Only null so we can "fake" this respose below
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
    return supabaseClient
        .rpc<ExchangeResponse>(RPCS.EXCHANGE_DIRECTIVES, {
            bearer_token: token,
        })
        .throwOnError()
        .single();
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
        return callUpdate(
            DIRECTIVES[type].generateUserClaim(dataForClaim),
            data.applied_directive
        );
    }
};

const getApplieDirectives = (type: keyof typeof DIRECTIVES, userId: string) => {
    let queryBuilder = supabaseClient.from<JoinedAppliedDirective>(
        TABLES.APPLIED_DIRECTIVES
    ).select(`
            id,
            directive_id,
            job_status,
            logs_token,
            user_id,
            user_claims,
            updated_at,
            directives !inner(spec->>type)
        `);

    queryBuilder = queryBuilder.eq('directives.spec->>type', type);
    queryBuilder = queryBuilder.eq('user_id', userId);

    return DIRECTIVES[type]
        .queryFilter(queryBuilder)
        .order('updated_at', { ascending: false })
        .limit(1);
};

export { exchangeBearerToken, getApplieDirectives, submitDirective };
