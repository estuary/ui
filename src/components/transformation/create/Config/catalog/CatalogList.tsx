import {
    Box,
    IconButton,
    List,
    ListItem,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import CatalogListItem from 'components/transformation/create/Config/catalog/CatalogListItem';
import { defaultOutline, disabledButtonText } from 'context/Theme';
import { Plus } from 'iconoir-react';
import { MouseEventHandler, ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { DerivationAttribute } from 'stores/TransformationCreate/types';
import { hasLength } from 'utils/misc-utils';

export interface CatalogListContent {
    attributeId: string;
    value: string;
    editorInvalid: boolean;
    nestedValue?: string;
}

interface Props {
    addButtonClickHandler: MouseEventHandler<HTMLButtonElement>;
    content: CatalogListContent[];
    fixedAttributeType: DerivationAttribute;
    header: ReactNode;
    extendList?: boolean;
    height?: number;
}

function CatalogList({
    fixedAttributeType,
    content,
    addButtonClickHandler,
    header,
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
                        {header}
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
                        {content.map(
                            ({
                                attributeId,
                                value,
                                nestedValue,
                                editorInvalid,
                            }) => (
                                <CatalogListItem
                                    key={attributeId}
                                    attributeId={attributeId}
                                    fixedAttributeType={fixedAttributeType}
                                    itemLabel={value}
                                    editorInvalid={editorInvalid}
                                    nestedItemLabel={nestedValue}
                                />
                            )
                        )}
                    </Box>
                ) : (
                    <ListItem>
                        <Typography sx={{ mt: 1 }}>
                            <FormattedMessage
                                id="newTransform.config.message.listEmpty"
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
