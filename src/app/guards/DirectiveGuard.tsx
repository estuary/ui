import FullPageSpinner from 'components/fullPage/Spinner';
import FullPageWrapper from 'directives/FullPageWrapper';
import { DIRECTIVES, DirectiveStates } from 'directives/shared';
import useAppliedDirectives from 'hooks/useAppliedDirectives';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { ReactNode, useMemo } from 'react';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    form: ReactNode;
    selectedDirective: keyof typeof DIRECTIVES;
}

const DirectiveGuard = ({ children, form, selectedDirective }: Props) => {
    useBrowserTitle('browserTitle.legal');

    console.log(`Guard:${selectedDirective}`);

    const { appliedDirective, isValidating } =
        useAppliedDirectives(selectedDirective);

    const calculateStatus = useMemo(
        () => DIRECTIVES[selectedDirective].calculateStatus,
        [selectedDirective]
    );

    console.log('appliedDirective', appliedDirective);

    const directiveState = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (isValidating || !appliedDirective) {
            return null;
        }

        return calculateStatus(appliedDirective);
    }, [isValidating, appliedDirective, calculateStatus]);

    console.log(`${selectedDirective} directiveState`, {
        directiveState,
    });

    if (isValidating) {
        return <FullPageSpinner />;
    } else if (directiveState !== DirectiveStates.FUFILLED) {
        return <FullPageWrapper>{form}</FullPageWrapper>;
    } else {
        // Only returning the child and need the JSX Fragment
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
};

export default DirectiveGuard;
