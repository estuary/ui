import { Auth } from '@supabase/ui';
import { getAppliedDirectives } from 'api/directives';
import { DIRECTIVES } from 'directives/shared';
import { AppliedDirective, JoinedAppliedDirective } from 'types';
import { useSelectNew } from './supabase-swr/hooks/useSelect';

function useAppliedDirectives(type: keyof typeof DIRECTIVES) {
    const { user } = Auth.useUser();

    const { data, error, mutate, isValidating } =
        useSelectNew<JoinedAppliedDirective>(
            user?.id ? getAppliedDirectives(type, user.id) : null
        );

    return {
        appliedDirective: data ? (data.data[0] as AppliedDirective<any>) : null,
        error,
        mutate,
        isValidating,
    };
}

export default useAppliedDirectives;
