import { useClient } from 'hooks/supabase-swr';
import GoogleButton from 'react-google-button';

interface Props {
    onError: (error: any) => void;
    redirectPath: string;
}

function GoogleAuthButton({ onError, redirectPath }: Props) {
    const supabaseClient = useClient();

    const login = async () => {
        const response = await supabaseClient.auth.signIn(
            {
                provider: 'google',
            },
            {
                redirectTo: redirectPath,
            }
        );
        if (response.error) {
            onError(response.error);
        }
    };

    return <GoogleButton onClick={login} />;
}

export default GoogleAuthButton;
