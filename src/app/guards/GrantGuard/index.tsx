import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { BaseComponentProps } from 'types';
import GrantGuardProcessor from './Processor';

function GrantGuard({ children }: BaseComponentProps) {
    const grantToken = useGlobalSearchParams(GlobalSearchParams.GRANT_TOKEN);

    if (grantToken) {
        // If we have a grant token then go ahead and enter the processor.
        //  This means we'll never just "fall through" to the children like below
        //  and even if we can skip this token we'll handle that with a navigate to
        //  home call in the processor
        return <GrantGuardProcessor grantToken={grantToken} />;
    } else {
        // We do not have a grant token so just skip the entire process and render what we need to

        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default GrantGuard;
