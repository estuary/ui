import { Auth } from '@supabase/ui';
import { getAppliedDirectives } from 'api/directives';
import { DIRECTIVES } from 'directives/shared';
import { logRocketConsole } from 'services/shared';
import { AppliedDirective, JoinedAppliedDirective } from 'types';
import { useSelectNew } from './supabase-swr/hooks/useSelect';

function useAppliedDirectives(type: keyof typeof DIRECTIVES, token?: string) {
    const { user } = Auth.useUser();

    const { data, error, mutate, isValidating } =
        useSelectNew<JoinedAppliedDirective>(
            user ? getAppliedDirectives(type, token) : null
        );

    logRocketConsole('useAppliedDirectives', { data, isValidating });

    return {
        appliedDirective: data
            ? (data.data[0] as AppliedDirective<any> | undefined)
            : null,
        error,
        mutate,
        isValidating,
    };
}

export default useAppliedDirectives;
