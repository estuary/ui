import { Cancel } from 'iconoir-react';

import { IconButton, ListItemText } from '@mui/material';

import { typographyTruncation } from 'context/Theme';

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
                primaryTypographyProps={typographyTruncation}
            />

            <IconButton
                disabled={disabled}
                size="small"
                onClick={handlers.removeCollection}
                sx={{ color: (theme) => theme.palette.text.primary }}
            >
                <Cancel />
            </IconButton>
        </>
    );
}

export default CollectionSelectorRow;
