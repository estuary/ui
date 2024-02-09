import { BaseComponentProps } from 'types';

function Client({ children }: BaseComponentProps) {
    console.log('Client Mock');

    // The client is mocked within user so they can share the Auth object

    return <>{children}</>;
}

export default Client;
