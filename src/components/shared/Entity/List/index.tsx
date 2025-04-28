import type { EntityListProps } from 'src/components/shared/Entity/List/types';

import { Stack } from '@mui/material';

import { useIntl } from 'react-intl';

import CollectionSelector from 'src/components/collection/Selector';
import CatalogList from 'src/components/transformation/create/Config/catalog/CatalogList';
import CollectionList from 'src/components/transformation/create/Config/catalog/CollectionList';

function EntityList({ content, PrimaryCTA, toggle }: EntityListProps) {
    const intl = useIntl();

    return (
        <Stack direction="column" sx={{ height: '100%' }}>
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
            />
        </Stack>
    );
}

export default EntityList;
