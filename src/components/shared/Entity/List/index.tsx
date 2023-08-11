import { Box } from '@mui/material';
import AddCollection from 'components/transformation/create/Config/catalog/AddCollection';
import CatalogList, {
    CatalogListContent,
} from 'components/transformation/create/Config/catalog/CatalogList';
import CollectionList from 'components/transformation/create/Config/catalog/CollectionList';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    content: CatalogListContent[];
    header: ReactNode;
    open: boolean;
    primaryCTA: ReactNode;
    toggle: (args: any) => void;
}

const DIALOG_ID = 'add-collection-search-dialog_entity-list';

function EntityList({ content, open, header, primaryCTA, toggle }: Props) {
    return (
        <Box>
            <AddCollection
                id={DIALOG_ID}
                open={open}
                primaryCTA={primaryCTA}
                toggle={toggle}
                title={
                    <FormattedMessage id="newTransform.config.transform.addDialog.header" />
                }
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
