import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    firstLoad?: boolean;
    checkForGrant?: boolean;
}

function RequireAuth({ children }: Props) {
    console.log('mock require auth');
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default RequireAuth;
