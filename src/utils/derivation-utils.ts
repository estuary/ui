import { uniq } from 'lodash';
import {
    MigrationDictionary,
    TransformConfig,
    TransformConfigDictionary,
} from 'stores/TransformationCreate/types';
import { Transform } from 'types';
import { stripPathing } from 'utils/misc-utils';

export const updateTransforms = (
    transformSource: string,
    newLambda: string,
    existingConfigs: TransformConfigDictionary
): Transform[] =>
    Object.values(existingConfigs).map(
        ({ collection, lambda, shuffle }): Transform => ({
            name: stripPathing(collection),
            source: collection,
            lambda: collection === transformSource ? newLambda : lambda,
            shuffle,
        })
    );

// TODO (transforms): Only propagate migrations that contain at least one alphanumeric character.
// It may be best to strict the editor value itself, removing all leading spaces and
// trimming tailing spaces when more than one is present.
export const updateMigrations = (
    migrationId: string,
    newMigration: string,
    existingMigrations: MigrationDictionary
): string[] =>
    Object.entries(existingMigrations)
        .map(([id, migration]) =>
            id === migrationId ? newMigration : migration
        )
        .filter((migration) => migration !== '');

export const templateTransformConfig = (
    source: string,
    entityName: string,
    shuffleKeys?: string[]
): TransformConfig => {
    const tableName = stripPathing(source);

    return {
        filename: `${entityName}.lambda.${tableName}.sql`,
        lambda: '',
        sqlTemplate: 'Simple Select',
        shuffle: shuffleKeys ? { key: shuffleKeys } : 'any',
        collection: source,
    };
};

export const evaluateTransformConfigs = (
    selectedCollections: string[],
    transformCount: number,
    existingTransformConfigs: TransformConfigDictionary,
    name: string
): TransformConfigDictionary => {
    const existingCollections = Object.values(existingTransformConfigs).map(
        ({ collection }) => collection
    );

    const compositeSourceCollections: string[] = uniq([
        ...existingCollections,
        ...selectedCollections,
    ]);

    let compositeTransformConfigs: TransformConfigDictionary = {};

    compositeSourceCollections.forEach((source, index) => {
        if (!existingCollections.includes(source)) {
            // Create a transform configuration for a source collection that did not previously exist.

            const compositeIndex = transformCount + index + 1;

            compositeTransformConfigs = {
                ...compositeTransformConfigs,
                [`${name}.lambda.${compositeIndex}.sql`]:
                    templateTransformConfig(source, name),
            };
        } else if (selectedCollections.includes(source)) {
            // Retain the transform configuration for an existing source collection
            // that is in the set of selected collections.

            const configEntry = Object.entries(existingTransformConfigs).find(
                ([_id, config]) => config.collection === source
            );

            if (configEntry) {
                const [transformId, transformConfig] = configEntry;

                compositeTransformConfigs = {
                    ...compositeTransformConfigs,
                    [transformId]: transformConfig,
                };
            }
        }
    });

    return compositeTransformConfigs;
};
