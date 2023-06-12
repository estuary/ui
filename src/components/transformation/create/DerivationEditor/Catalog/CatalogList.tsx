import {
    Box,
    IconButton,
    List,
    ListItem,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import CatalogListItem from 'components/transformation/create/DerivationEditor/Catalog/CatalogListItem';
import { EditPencil } from 'iconoir-react';
import { CSSProperties, MouseEventHandler, useEffect, useState } from 'react';
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
    height?: number;
}

const DEFAULT_LIST_HEIGHT = 400.5;

const getListItemContainerHeight = (height?: number): string => {
    const evaluatedHeight = (height ?? DEFAULT_LIST_HEIGHT) - 37;

    return `${evaluatedHeight}px`;
};

function CatalogList({
    fixedAttributeType,
    content,
    addButtonClickHandler,
    borderBottom,
    height,
}: Props) {
    const theme = useTheme();

    const [windowResizing, setWindowResizing] = useState(false);
    const [clientWidth, setClientWidth] = useState<number | undefined>();
    const [scrollWidth, setScrollWidth] = useState<number | undefined>();

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const handleResize = () => {
            clearTimeout(timeout);

            setWindowResizing(true);

            timeout = setTimeout(() => {
                setWindowResizing(false);
            }, 200);
        };
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!windowResizing) {
            setClientWidth(
                document.querySelector('div#list-item-container')?.clientWidth
            );

            setScrollWidth(
                document.querySelector('div#list-item-container')?.scrollWidth
            );
        }
    }, [setClientWidth, setScrollWidth, windowResizing]);

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
                        <EditPencil
                            style={{ color: theme.palette.primary.main }}
                        />
                    </IconButton>
                </Stack>
            }
            sx={{
                height: height ?? '400.5px',
                borderBottom,
            }}
        >
            <Box
                id="list-item-container"
                sx={{
                    height: getListItemContainerHeight(height),
                    overflowX: 'auto',
                }}
            >
                {hasLength(content) ? (
                    <Box
                        sx={{
                            minWidth:
                                clientWidth === scrollWidth
                                    ? clientWidth
                                    : 'max-content',
                        }}
                    >
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
