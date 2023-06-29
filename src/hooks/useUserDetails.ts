import { Auth } from '@supabase/ui';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import { logRocketConsole } from 'services/logrocket';

function useUserDetails() {
    const { user } = Auth.useUser();

    const [avatar, setAvatar] = useState<string | null>(null);
    const [email, setEmail] = useState<string | undefined>(undefined);
    const [emailVerified, setEmailVerified] = useState<boolean>(false);
    const [id, setId] = useState<string | undefined>(undefined);
    const [userName, setUserName] = useState<string | undefined>(undefined);

    useEffect(() => {
        logRocketConsole('fetching user details for menu', user);
        if (user) {
            if (!isEmpty(user.user_metadata)) {
                setUserName(
                    user.user_metadata.full_name ?? user.user_metadata.email
                );
                setEmail(user.user_metadata.email);
                setEmailVerified(user.user_metadata.email_verified);
                setAvatar(user.user_metadata.avatar_url);
            } else {
                setUserName(user.email);
                setEmail(user.email);
                setEmailVerified(false);
            }

            setId(user.id);
        }
    }, [user]);

    return {
        id,
        userName,
        email,
        emailVerified,
        avatar,
    };
}

export default useUserDetails;
