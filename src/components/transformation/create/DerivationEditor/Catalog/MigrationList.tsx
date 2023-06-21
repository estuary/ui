import CatalogList, {
    CatalogListContent,
} from 'components/transformation/create/DerivationEditor/Catalog/CatalogList';
import { useMemo, useState } from 'react';
import {
    useTransformationCreate_addMigrations,
    useTransformationCreate_migrations,
} from 'stores/TransformationCreate/hooks';

function MigrationList() {
    const migrations = useTransformationCreate_migrations();
    const addMigrations = useTransformationCreate_addMigrations();

    const [expanded, setExpanded] = useState(false);

    const content: CatalogListContent[] = useMemo(
        () =>
            Object.keys(migrations).map((attributeId) => ({
                attributeId,
                value: attributeId,
            })),
        [migrations]
    );

    const handlers = {
        insertBlankMigration: () => {
            addMigrations(['']);
        },
        toggleAccordion: () => {
            setExpanded(!expanded);
        },
    };

    return (
        <CatalogList
            fixedAttributeType="migration"
            content={content}
            addButtonClickHandler={handlers.insertBlankMigration}
        />
    );
}

export default MigrationList;
