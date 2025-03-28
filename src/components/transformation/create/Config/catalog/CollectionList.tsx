import { useCallback } from 'react';

import { Box, ListItem, Typography } from '@mui/material';

import { CatalogListContent } from './CatalogList';
import { FormattedMessage } from 'react-intl';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

import CatalogListItem from 'src/components/transformation/create/Config/catalog/CatalogListItem';
import { DerivationAttribute } from 'src/stores/TransformationCreate/types';
import { hasLength } from 'src/utils/misc-utils';

interface Props {
    content: CatalogListContent[];
    fixedAttributeType: DerivationAttribute;
}

const lineHeight = 52;

function CollectionList({ content, fixedAttributeType }: Props) {
    const renderRow = useCallback(
        (props: ListChildComponentProps) => {
            const { index, style } = props;
            const { attributeId, value, nestedValue, editorInvalid } =
                content[index];

            return (
                <div style={style}>
                    <CatalogListItem
                        key={attributeId}
                        attributeId={attributeId}
                        fixedAttributeType={fixedAttributeType}
                        itemLabel={value}
                        editorInvalid={editorInvalid}
                        nestedItemLabel={nestedValue}
                    />
                </div>
            );
        },
        [content, fixedAttributeType]
    );

    if (hasLength(content)) {
        return (
            <Box sx={{ height: '100%' }}>
                <AutoSizer style={{ width: '100%' }}>
                    {({ width, height }: AutoSizer['state']) => {
                        // TODO (typing) pretty sure this is the right type but need
                        //  to figure that out before launching this
                        return (
                            <FixedSizeList
                                height={height}
                                width={width}
                                itemSize={lineHeight}
                                itemCount={content.length}
                                overscanCount={10}
                            >
                                {renderRow}
                            </FixedSizeList>
                        );
                    }}
                </AutoSizer>
            </Box>
        );
    }

    return (
        <ListItem>
            <Typography sx={{ mt: 1 }}>
                <FormattedMessage
                    id="newTransform.config.message.listEmpty"
                    values={{ contentType: fixedAttributeType }}
                />
            </Typography>
        </ListItem>
    );
}

export default CollectionList;
