import { Box } from '@mui/material';
import CollectionSelector from 'components/collection/Selector';
import { AddCollectionDialogCTAProps } from 'components/shared/Entity/types';
import CatalogList, {
    CatalogListContent,
} from 'components/transformation/create/Config/catalog/CatalogList';
import CollectionList from 'components/transformation/create/Config/catalog/CollectionList';
import { ReactNode } from 'react';
import { useIntl } from 'react-intl';

interface Props extends AddCollectionDialogCTAProps {
    content: CatalogListContent[];
    header: ReactNode;
    primaryCTA: ReactNode;
}

function EntityList({ content, header, primaryCTA, toggle }: Props) {
    const intl = useIntl();

    return (
        <Box>
            <CollectionSelector
                itemType={intl.formatMessage({
                    id: 'newTransform.config.transform.header',
                })}
                selectedCollections={[]}
                AddSelectedButton={primaryCTA}
            />

            <CatalogList
                content={
                    <CollectionList
                        content={content}
                        fixedAttributeType="transform"
                    />
                }
                addButtonClickHandler={() => {
                    console.log('addButtonClickHandler');
                    toggle(true);
                }}
                height={532}
                header={header}
            />
        </Box>
    );
}

export default EntityList;
