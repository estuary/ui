import { BaseComponentProps } from 'types';

function SwrConfigProvider({ children }: BaseComponentProps) {
    console.log('swr mock');
    // This is mocked in the user mock
    return <>{children}</>;
}

export default SwrConfigProvider;
