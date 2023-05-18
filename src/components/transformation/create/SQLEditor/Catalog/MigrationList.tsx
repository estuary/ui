import CatalogList from 'components/transformation/create/SQLEditor/Catalog/CatalogList';
import { useMemo } from 'react';
import {
    useTransformationCreate_addMigrations,
    useTransformationCreate_migrations,
} from 'stores/TransformationCreate/hooks';

function MigrationList() {
    const migrations = useTransformationCreate_migrations();
    const addMigrations = useTransformationCreate_addMigrations();

    const content = useMemo(
        () => Object.keys(migrations).map((id) => [id, id]),
        [migrations]
    );

    const handlers = {
        insertBlankMigration: () => {
            addMigrations(['']);
        },
    };

    return (
        <CatalogList
                contentType="migration"
                content={content}
                addButtonClickHandler={handlers.insertBlankMigration}
                minHeight={200}
            />
    );
}

export default MigrationList;
