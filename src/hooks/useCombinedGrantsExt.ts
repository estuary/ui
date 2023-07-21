import { Grants } from 'types';

import { Auth } from '@supabase/ui';

import { getGrantsForUser } from 'api/combinedGrantsExt';

import { singleCallSettings } from 'context/SWR';

import { useSelectNew } from './supabase-swr/hooks/useSelect';

interface Props {
    adminOnly?: boolean;
    singleCall?: boolean;
}
const defaultResponse: Grants[] = [];

function useCombinedGrantsExt({ adminOnly, singleCall }: Props) {
    const { user } = Auth.useUser();

    const { data, error, mutate, isValidating } = useSelectNew(
        user?.id ? getGrantsForUser(user.id, adminOnly) : null,
        singleCall ? singleCallSettings : undefined
    );

    return {
        combinedGrants: data ? (data.data as Grants[]) : defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useCombinedGrantsExt;
