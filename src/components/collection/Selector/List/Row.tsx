import { IconButton, ListItemText } from '@mui/material';

import { X } from 'lucide-react';

import { typographyTruncation } from 'src/context/Theme';

interface Props {
    collection: string;
    disabled?: boolean;
    removeCollection: (collectionName: string) => void;
}

function CollectionSelectorRow({
    removeCollection,
    collection,
    disabled,
}: Props) {
    const handlers = {
        removeCollection: (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();
            removeCollection(collection);
        },
    };

    return (
        <>
            <ListItemText
                primary={collection}
                slotProps={{
                    primary: { ...typographyTruncation },
                }}
            />
            <IconButton
                disabled={disabled}
                size="small"
                onClick={handlers.removeCollection}
                sx={{ color: (theme) => theme.palette.text.primary }}
            >
                <X />
            </IconButton>
        </>
    );
}

export default CollectionSelectorRow;
