import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { BaseComponentProps } from 'types';
import GrantGuardProcessor from './Processor';

function GrantGuard({ children }: BaseComponentProps) {
    const grantToken = useGlobalSearchParams(GlobalSearchParams.GRANT_TOKEN);

    if (grantToken) {
        return <GrantGuardProcessor grantToken={grantToken} />;
    } else {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default GrantGuard;
