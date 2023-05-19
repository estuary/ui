import {
    IconButton,
    List,
    ListItem,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import CatalogListItem from 'components/transformation/create/DerivationEditor/Catalog/CatalogListItem';
import { Plus } from 'iconoir-react';
import { CSSProperties, MouseEventHandler } from 'react';
import { FormattedMessage } from 'react-intl';
import { DerivationAttribute } from 'stores/TransformationCreate/types';
import { hasLength } from 'utils/misc-utils';

interface Props {
    fixedAttributeType: DerivationAttribute;
    content: [string, string | null][];
    addButtonClickHandler: MouseEventHandler<HTMLButtonElement>;
    borderBottom?: CSSProperties['borderBottom'];
    minHeight?: number;
}

function CatalogList({
    fixedAttributeType,
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
                            p: 1,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                        }}
                    >
                        <FormattedMessage
                            id={`newTransform.editor.catalog.${fixedAttributeType}.header`}
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
                        fixedAttributeType={fixedAttributeType}
                        itemLabel={attributeId}
                        nestedItemLabel={value}
                    />
                ))
            ) : (
                <ListItem>
                    <Typography sx={{ mt: 1 }}>
                        <FormattedMessage
                            id="newTransform.editor.catalog.message.empty"
                            values={{ contentType: fixedAttributeType }}
                        />
                    </Typography>
                </ListItem>
            )}
        </List>
    );
}

export default CatalogList;
