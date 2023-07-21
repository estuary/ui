import { FormattedMessage } from 'react-intl';

import { Box, ListItem, Typography } from '@mui/material';

import CatalogListItem from 'components/transformation/create/Config/catalog/CatalogListItem';

import { DerivationAttribute } from 'stores/TransformationCreate/types';

import { hasLength } from 'utils/misc-utils';

import { CatalogListContent } from './CatalogList';

interface Props {
    content: CatalogListContent[];
    fixedAttributeType: DerivationAttribute;
}

function CollectionList({ content, fixedAttributeType }: Props) {
    if (hasLength(content)) {
        return (
            <Box sx={{ minWidth: 'max-content' }}>
                {content.map(
                    ({ attributeId, value, nestedValue, editorInvalid }) => (
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
