import type { EntityListProps } from 'src/components/shared/Entity/List/types';

import { Box } from '@mui/material';

import { useIntl } from 'react-intl';

import CollectionSelector from 'src/components/collection/Selector';
import CatalogList from 'src/components/transformation/create/Config/catalog/CatalogList';
import CollectionList from 'src/components/transformation/create/Config/catalog/CollectionList';

function EntityList({ content, PrimaryCTA, toggle }: EntityListProps) {
    const intl = useIntl();

    return (
        <Box>
            <CollectionSelector
                itemType={intl.formatMessage({
                    id: 'newTransform.config.transform.header',
                })}
                selectedCollections={[]}
                AddSelectedButton={PrimaryCTA}
            />

            <CatalogList
                content={
                    <CollectionList
                        content={content}
                        fixedAttributeType="transform"
                    />
                }
                addButtonClickHandler={() => {
                    toggle(true);
                }}
                height={532}
            />
        </Box>
    );
}

export default EntityList;
