import { BaseComponentProps } from 'types';

// const SELECTED_DIRECTIVE = 'clickToAccept';

function LegalGuard({ children }: BaseComponentProps) {
    // const { directive, loading, status, mutate } =
    //     useDirectiveGuard(SELECTED_DIRECTIVE);

    // if (loading || status === null) {
    //     return <FullPageSpinner />;
    // } else if (status !== 'fulfilled') {
    //     return (
    //         <FullPageWrapper>
    //             <ClickToAccept
    //                 directive={directive}
    //                 status={status}
    //                 mutate={mutate}
    //             />
    //         </FullPageWrapper>
    //     );
    // } else {
    //     // Only returning the child and need the JSX Fragment
    //     // eslint-disable-next-line react/jsx-no-useless-fragment
    //     return <>{children}</>;
    // }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default LegalGuard;
