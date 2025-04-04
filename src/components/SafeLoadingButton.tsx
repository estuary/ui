import type { LoadingButtonProps } from '@mui/lab';

// This is the only file that is allowed to import LoadingButton
// eslint-disable-next-line no-restricted-imports
import { LoadingButton } from '@mui/lab';

const SafeLoadingButton = ({ children, ...props }: LoadingButtonProps) => {
    return (
        <LoadingButton {...props}>
            <span>{children}</span>
        </LoadingButton>
    );
};

export default SafeLoadingButton;
