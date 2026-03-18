import { Link } from '@mui/material';

interface ActionLinkProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}

export function ActionLink({ children, onClick, disabled }: ActionLinkProps) {
    return (
        <Link
            component="button"
            variant="body2"
            underline="hover"
            onClick={onClick}
            sx={{
                opacity: disabled ? 0.5 : 1,
                pointerEvents: disabled ? 'none' : 'auto',
            }}
        >
            {children}
        </Link>
    );
}
