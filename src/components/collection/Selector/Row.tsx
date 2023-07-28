import { IconButton, ListItemText } from '@mui/material';
import { typographyTruncation } from 'context/Theme';
import { Cancel } from 'iconoir-react';

interface Props {
    collection: string;
    disabled?: boolean;
    removeCollection?: (collectionName: string) => void;
}

function CollectionSelectorRow({
    removeCollection,
    collection,
    disabled,
}: Props) {
    return (
        <>
            <ListItemText
                primary={collection}
                primaryTypographyProps={typographyTruncation}
            />

            {!removeCollection ? null : (
                <IconButton
                    disabled={disabled}
                    size="small"
                    onClick={(event: React.MouseEvent<HTMLElement>) => {
                        event.preventDefault();
                        removeCollection(collection);
                    }}
                    sx={{ color: (theme) => theme.palette.text.primary }}
                >
                    <Cancel />
                </IconButton>
            )}
        </>
    );
}

export default CollectionSelectorRow;
