import {
    IconButton,
    List,
    ListItem,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import CatalogListItem from 'components/transformation/create/DerivationEditor/Catalog/CatalogListItem';
import { EditPencil, Plus } from 'iconoir-react';
import { CSSProperties, MouseEventHandler } from 'react';
import { FormattedMessage } from 'react-intl';
import { DerivationAttribute } from 'stores/TransformationCreate/types';
import { hasLength } from 'utils/misc-utils';

export interface CatalogListContent {
    attributeId: string;
    value: string;
    nestedValue?: string;
}

interface Props {
    fixedAttributeType: DerivationAttribute;
    content: CatalogListContent[];
    addButtonClickHandler: MouseEventHandler<HTMLButtonElement>;
    borderBottom?: CSSProperties['borderBottom'];
    minHeight?: number;
}

function CatalogList({
    fixedAttributeType,
    content,
    addButtonClickHandler,
    borderBottom,
    minHeight,
}: Props) {
    const theme = useTheme();

    return (
        <List
            disablePadding
            subheader={
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography
                        component="div"
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
                        {fixedAttributeType === 'transform' ? (
                            <EditPencil
                                style={{ color: theme.palette.primary.main }}
                            />
                        ) : (
                            <Plus
                                style={{ color: theme.palette.primary.main }}
                            />
                        )}
                    </IconButton>
                </Stack>
            }
            sx={{
                minHeight: minHeight ?? '400.5px',
                borderBottom,
            }}
        >
            {hasLength(content) ? (
                content.map(({ attributeId, value, nestedValue }) => (
                    <CatalogListItem
                        key={attributeId}
                        attributeId={attributeId}
                        fixedAttributeType={fixedAttributeType}
                        itemLabel={value}
                        nestedItemLabel={nestedValue}
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
