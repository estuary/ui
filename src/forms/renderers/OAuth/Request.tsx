import FullPageSpinner from 'components/fullPage/Spinner';
import { useOAuth2 } from 'hooks/forks/react-use-oauth2/components';
import { useEffectOnce } from 'react-use';

interface Props {
    url: string;
}
function OAuthRequest({ url }: Props) {
    const onError = (error_: any) => {
        console.log('Error', error_);
    };
    const onSuccess = (payload: any) => {
        console.log('Success', payload);
    };

    const { data, loading, error, getAuth } = useOAuth2({
        authorizeUrl: url,
        responseType: 'token',
        onSuccess,
        onError,
    });

    console.log('oauth pop up', { data, loading, error, getAuth });

    useEffectOnce(() => {
        getAuth();
    });

    return <FullPageSpinner />;
}

export default OAuthRequest;
