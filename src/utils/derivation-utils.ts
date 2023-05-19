import { uniq } from 'lodash';
import {
    MigrationDictionary,
    TransformConfig,
    TransformConfigDictionary,
} from 'stores/TransformationCreate/types';
import { stripPathing } from 'utils/misc-utils';

interface Transform {
    name: string;
    source: string;
    lambda: string;
    shuffle?: {
        key: string[];
    };
}

export const updateTransforms = (
    transformSource: string,
    newLambda: string,
    existingConfigs: TransformConfigDictionary
): Transform[] =>
    Object.values(existingConfigs).map(
        ({ collection, lambda }): Transform => ({
            name: stripPathing(collection),
            source: collection,
            lambda: collection === transformSource ? newLambda : lambda,
        })
    );

export const updateMigrations = (
    migrationId: string,
    newMigration: string,
    existingMigrations: MigrationDictionary
): string[] =>
    Object.entries(existingMigrations).map(([id, migration]) =>
        id === migrationId ? newMigration : migration
    );

export const templateTransformConfig = (source: string): TransformConfig => ({
    lambda: 'SELECT * FROM demo/1234',
    sqlTemplate: 'Simple Select',
    collection: source,
});

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
                    templateTransformConfig(source),
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
