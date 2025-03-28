import { Button } from '@mui/material';

import { FormattedMessage } from 'react-intl';
import type { ProviderButtonProps } from 'src/components/login/Providers/types';
import { defaulticonSize } from 'src/components/login/Providers/buttons/shared';

const AzureButton = ({ login, isRegister, ...props }: ProviderButtonProps) => {
    return (
        <Button
            {...props}
            onClick={login}
            startIcon={
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={defaulticonSize}
                    height={defaulticonSize}
                    x="0px"
                    y="0px"
                    viewBox="0 0 48 48"
                >
                    <path
                        fill="#ff5722"
                        d="M6 6H22V22H6z"
                        transform="rotate(-180 14 14)"
                    />
                    <path
                        fill="#4caf50"
                        d="M26 6H42V22H26z"
                        transform="rotate(-180 34 14)"
                    />
                    <path
                        fill="#ffc107"
                        d="M26 26H42V42H26z"
                        transform="rotate(-180 34 34)"
                    />
                    <path
                        fill="#03a9f4"
                        d="M6 26H22V42H6z"
                        transform="rotate(-180 14 34)"
                    />
                </svg>
            }
            variant="outlined"
        >
            <FormattedMessage
                id={isRegister ? 'cta.register.azure' : 'cta.login.azure'}
            />
        </Button>
    );
};

export default AzureButton;
