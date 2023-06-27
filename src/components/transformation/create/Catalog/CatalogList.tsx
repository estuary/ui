import {
    Box,
    IconButton,
    List,
    ListItem,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import CatalogListItem from 'components/transformation/create/Catalog/CatalogListItem';
import { defaultOutline, disabledButtonText } from 'context/Theme';
import { Plus } from 'iconoir-react';
import { MouseEventHandler } from 'react';
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
    extendList?: boolean;
    height?: number;
}

function CatalogList({
    fixedAttributeType,
    content,
    addButtonClickHandler,
    extendList = true,
    height,
}: Props) {
    const theme = useTheme();

    return (
        <List
            disablePadding
            subheader={
                <Stack
                    direction="row"
                    sx={{
                        justifyContent: 'space-between',
                        borderBottom: defaultOutline[theme.palette.mode],
                    }}
                >
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
                        disabled={!extendList}
                        onClick={addButtonClickHandler}
                        sx={{ borderRadius: 0 }}
                    >
                        <Plus
                            style={{
                                color: extendList
                                    ? theme.palette.primary.main
                                    : disabledButtonText[theme.palette.mode],
                            }}
                        />
                    </IconButton>
                </Stack>
            }
        >
            <Box id="list-item-container" sx={{ height, overflowY: 'auto' }}>
                {hasLength(content) ? (
                    <Box sx={{ minWidth: 'max-content' }}>
                        {content.map(({ attributeId, value, nestedValue }) => (
                            <CatalogListItem
                                key={attributeId}
                                attributeId={attributeId}
                                fixedAttributeType={fixedAttributeType}
                                itemLabel={value}
                                nestedItemLabel={nestedValue}
                            />
                        ))}
                    </Box>
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
            </Box>
        </List>
    );
}

export default CatalogList;
