import FullPageSpinner from 'components/fullPage/Spinner';
import FullPageWrapper from 'directives/FullPageWrapper';
import { DIRECTIVES } from 'directives/shared';
import useAppliedDirectives from 'hooks/useAppliedDirectives';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { ReactNode, useMemo } from 'react';
import { BaseComponentProps } from 'types';
import { hasLength } from 'utils/misc-utils';

interface Props extends BaseComponentProps {
    form: ReactNode;
    selectedDirective: keyof typeof DIRECTIVES;
}

const DirectiveGuard = ({ children, form, selectedDirective }: Props) => {
    useBrowserTitle('browserTitle.legal');

    console.log(`Guard:${selectedDirective}`);

    const { appliedDirectives, isValidating } = useAppliedDirectives([
        selectedDirective,
    ]);

    const isClaimFulfilled = useMemo(
        () => DIRECTIVES[selectedDirective].isClaimFulfilled,
        [selectedDirective]
    );

    const directiveUnfulfilled = useMemo(() => {
        if (hasLength(appliedDirectives)) {
            return !isClaimFulfilled(appliedDirectives[0]);
        }

        return true;
    }, [appliedDirectives, isClaimFulfilled]);

    console.log(
        `${selectedDirective} directiveUnfulfilled`,
        directiveUnfulfilled
    );

    if (isValidating) {
        return <FullPageSpinner />;
    } else if (directiveUnfulfilled) {
        return <FullPageWrapper>{form}</FullPageWrapper>;
    } else {
        // Only returning the child and need the JSX Fragment
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
};

export default DirectiveGuard;
