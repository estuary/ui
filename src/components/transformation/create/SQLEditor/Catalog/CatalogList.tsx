import {
    IconButton,
    List,
    ListItem,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import CatalogListItem from 'components/transformation/create/SQLEditor/Catalog/CatalogListItem';
import { Plus } from 'iconoir-react';
import { CSSProperties, MouseEventHandler } from 'react';
import { FormattedMessage } from 'react-intl';
import { hasLength } from 'utils/misc-utils';

interface Props {
    contentType: 'transform' | 'migration';
    content: string[][];
    addButtonClickHandler: MouseEventHandler<HTMLButtonElement>;
    borderBottom?: CSSProperties['borderBottom'];
    minHeight?: number;
}

function CatalogList({
    contentType,
    content,
    addButtonClickHandler,
    borderBottom,
    minHeight = 400,
}: Props) {
    const theme = useTheme();

    return (
        <List
            disablePadding
            subheader={
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography
                        component="div"
                        color="secondary"
                        sx={{
                            py: 1,
                            pl: 1,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                        }}
                    >
                        <FormattedMessage
                            id={`newTransform.editor.catalog.${contentType}.header`}
                        />
                    </Typography>

                    <IconButton
                        onClick={addButtonClickHandler}
                        sx={{ borderRadius: 0 }}
                    >
                        <Plus style={{ color: theme.palette.secondary.main }} />
                    </IconButton>
                </Stack>
            }
            sx={{
                minHeight,
                borderBottom,
            }}
        >
            {hasLength(content) ? (
                content.map(([attributeId, value]) => (
                    <CatalogListItem
                        key={attributeId}
                        itemLabel={attributeId}
                        hiddenItemLabel={value}
                    />
                ))
            ) : (
                <ListItem>
                    <Typography sx={{ mt: 1 }}>
                        <FormattedMessage
                            id="newTransform.editor.catalog.message.empty"
                            values={{ contentType }}
                        />
                    </Typography>
                </ListItem>
            )}
        </List>
    );
}

export default CatalogList;
