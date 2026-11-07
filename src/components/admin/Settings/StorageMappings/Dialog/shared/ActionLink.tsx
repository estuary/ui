import { Link } from '@mui/material';

import { useSemanticLeaf } from 'react-semantic-tree';

interface ActionLinkProps {
    semanticLabel: string;
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}

export function ActionLink({
    children,
    onClick,
    disabled,
    semanticLabel,
}: ActionLinkProps) {
    const { ref } = useSemanticLeaf<HTMLButtonElement>(semanticLabel);
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
            {children}
        </Link>
    );
}
