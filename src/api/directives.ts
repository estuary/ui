import { DIRECTIVES } from 'directives/shared';
import { UserClaims } from 'directives/types';
import {
    RPCS,
    supabaseClient,
    TABLES,
    updateSupabase,
} from 'services/supabase';
import { AppliedDirective, Directive, Schema } from 'types';

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
        const response = await exchangeBearerToken(DIRECTIVES[type].token);
        data = response.data;
        error = response.error;
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

export { exchangeBearerToken, submitDirective };
