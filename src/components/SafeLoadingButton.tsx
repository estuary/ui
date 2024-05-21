import { LoadingButton, LoadingButtonProps } from '@mui/lab';

const SafeLoadingButton = ({ children, ...props }: LoadingButtonProps) => {
    return (
        <LoadingButton {...props}>
            <span>{children}</span>
        </LoadingButton>
    );
};

export default SafeLoadingButton;
