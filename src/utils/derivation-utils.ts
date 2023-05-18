import { TransformConfigDictionary } from 'stores/TransformationCreate/types';
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
    existingMigrations: { [key: string]: string }
): string[] =>
    Object.entries(existingMigrations).map(([id, migration]) =>
        id === migrationId ? newMigration : migration
    );
