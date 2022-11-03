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
    directive: Directive;
    applied_directive: AppliedDirective<UserClaims>;
}

const generateMatchData = (data: ExchangeResponse) => {
    return {
        id: data.applied_directive.id,
        logs_token: data.applied_directive.logs_token,
        directive_id: data.applied_directive.directive_id,
        user_id: data.applied_directive.user_id,
    };
};

const callUpdate = (user_claims: Schema, response: ExchangeResponse) => {
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
    existingDirective?: any,
    ...dataForClaim: any[]
) => {
    let data, error;
    if (!existingDirective) {
        const response = await exchangeBearerToken(DIRECTIVES[type].token);
        data = response.data;
        error = response.error;
    } else {
        data = existingDirective;
    }

    if (error) {
        console.error('error', error);
        return { data: [], error };
    } else {
        return callUpdate(
            DIRECTIVES[type].generateUserClaim(dataForClaim),
            data
        );
    }
};

export { exchangeBearerToken, submitDirective };
