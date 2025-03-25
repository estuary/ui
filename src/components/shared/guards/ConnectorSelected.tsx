import type { BaseComponentProps } from 'types';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { Navigate } from 'react-router-dom';
import { MAC_ADDR_RE } from 'validation';

// This 'navigateToPath' is so stupid and so annoying. However, for whatever reason
//  if you have the navigate to equal to '..' it threw you back up too many levels
interface Props extends BaseComponentProps {
    navigateToPath: string;
}

// This is quick - but really we should just make a general "SearchParamGuard" that
//  can easily check we have everything we need.
function ConnectorSelectedGuard({ children, navigateToPath }: Props) {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    if (!MAC_ADDR_RE.test(connectorId)) {
        return <Navigate to={navigateToPath} replace />;
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default ConnectorSelectedGuard;
