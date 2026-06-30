import type { BaseComponentProps } from 'src/types';

import { Navigate } from 'react-router-dom';

import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { FULL_IMAGE_NAME_RE } from 'src/validation';

// This 'navigateToPath' is so stupid and so annoying. However, for whatever reason
//  if you have the navigate to equal to '..' it threw you back up too many levels
interface Props extends BaseComponentProps {
    navigateToPath: string;
}

// This is quick - but really we should just make a general "SearchParamGuard" that
//  can easily check we have everything we need.
function ConnectorSelectedGuard({ children, navigateToPath }: Props) {
    const connectorImagePath = useGlobalSearchParams(
        GlobalSearchParams.CONNECTOR_IMAGE_PATH
    );

    if (!FULL_IMAGE_NAME_RE.test(connectorImagePath ?? '')) {
        return <Navigate to={navigateToPath} replace />;
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default ConnectorSelectedGuard;
