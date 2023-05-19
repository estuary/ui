import CatalogList from 'components/transformation/create/DerivationEditor/Catalog/CatalogList';
import { useMemo } from 'react';
import {
    useTransformationCreate_addMigrations,
    useTransformationCreate_migrations,
} from 'stores/TransformationCreate/hooks';

function MigrationList() {
    const migrations = useTransformationCreate_migrations();
    const addMigrations = useTransformationCreate_addMigrations();

    const content: [string, null][] = useMemo(
        () => Object.keys(migrations).map((id) => [id, null]),
        [migrations]
    );

    const handlers = {
        insertBlankMigration: () => {
            addMigrations(['']);
        },
    };

    return (
        <CatalogList
            fixedAttributeType="migration"
            content={content}
            addButtonClickHandler={handlers.insertBlankMigration}
            minHeight={200}
        />
    );
}

export default MigrationList;
