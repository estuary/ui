import { accessToken } from 'api/oauth';
import FullPageSpinner from 'components/fullPage/Spinner';
import { useOAuth2 } from 'hooks/forks/react-use-oauth2/components';
import { useEffectOnce } from 'react-use';

interface Props {
    url: string;
    state: string;
}
function OAuthRequest({ state, url }: Props) {
    const onError = (error_: any) => {
        console.log('Error', error_);
    };
    const onSuccess = async (payload: any) => {
        console.log('Success', payload);
        const tokenResponse = await accessToken(payload.state, payload.code);

        console.log('made second call', tokenResponse);
    };

    const { data, loading, error, getAuth } = useOAuth2({
        authorizeUrl: url,
        state,
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
