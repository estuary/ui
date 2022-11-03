import { DIRECTIVES } from 'directives/shared';
import useAppliedDirectives from 'hooks/useAppliedDirectives';
import { useMemo } from 'react';

const useDirectiveGuard = (selectedDirective: keyof typeof DIRECTIVES) => {
    const { appliedDirective, isValidating } =
        useAppliedDirectives(selectedDirective);

    const calculateStatus = useMemo(
        () => DIRECTIVES[selectedDirective].calculateStatus,
        [selectedDirective]
    );

    const directiveState = useMemo(() => {
        if (isValidating) {
            return null;
        }

        return calculateStatus(appliedDirective);
    }, [isValidating, appliedDirective, calculateStatus]);

    console.log(`${selectedDirective} directiveState`, {
        directiveState,
    });

    return useMemo(() => {
        if (directiveState === null) {
            return {
                loading: true,
                directive: null,
                status: null,
            };
        } else {
            return {
                loading: false,
                directive: appliedDirective,
                status: directiveState,
            };
        }
    }, [appliedDirective, directiveState]);
};

export default useDirectiveGuard;
