import type { EntityListProps } from './types';
import { Box } from '@mui/material';
import CollectionSelector from 'components/collection/Selector';
import CatalogList from 'components/transformation/create/Config/catalog/CatalogList';
import CollectionList from 'components/transformation/create/Config/catalog/CollectionList';
import { useIntl } from 'react-intl';

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
