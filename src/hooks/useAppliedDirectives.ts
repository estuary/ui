import { getAppliedDirectives } from 'api/directives';
import { DIRECTIVES } from 'directives/shared';
import { AppliedDirective, JoinedAppliedDirective } from 'types';
import { useSelectNew } from './supabase-swr/hooks/useSelect';

function useAppliedDirectives(type: keyof typeof DIRECTIVES, token?: string) {
    const { data, error, mutate, isValidating } =
        useSelectNew<JoinedAppliedDirective>(getAppliedDirectives(type, token));

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
