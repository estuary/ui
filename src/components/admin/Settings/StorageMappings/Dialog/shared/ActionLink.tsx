import { Link } from '@mui/material';

import { useLeaf } from 'react-semantic-tree';

interface ActionLinkProps {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
}

export function ActionLink({ onClick, disabled, label }: ActionLinkProps) {
    const { ref } = useLeaf('Action Link', { label });
    return (
        <Link
            ref={ref}
            component="button"
            variant="body2"
            underline="hover"
            onClick={onClick}
            sx={{
                opacity: disabled ? 0.5 : 1,
                pointerEvents: disabled ? 'none' : 'auto',
            }}
        >
            {label}
        </Link>
    );
}
