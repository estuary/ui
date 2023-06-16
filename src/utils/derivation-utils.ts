import { isArray, uniq } from 'lodash';
import {
    MigrationDictionary,
    TransformConfig,
    TransformConfigDictionary,
} from 'stores/TransformationCreate/types';
import { DerivationLanguage, Transform, Transform_Shuffle } from 'types';
import { stripPathing } from 'utils/misc-utils';

// Constants for part of the templates down below
const key = ['/your_key'];
const schema = {
    type: 'object',
    properties: { your_key: { type: 'string' } },
    required: ['your_key'],
};

interface TemplateOptions {
    existingTransforms?: TransformConfig[];
    existingMigrations?: string[];
    templateFiles?: boolean;
}

const formatSqlTransforms = (
    source: string,
    entityName: string,
    templateFiles?: boolean,
    lambda?: string,
    shuffle?: Transform_Shuffle
): Transform => {
    const tableName = stripPathing(source);

    let evaluatedLambda = '';

    if (lambda) {
        evaluatedLambda = lambda;
    } else if (templateFiles) {
        evaluatedLambda = `${entityName}.lambda.${tableName}.sql`;
    }

    return {
        name: tableName,
        source,
        lambda: evaluatedLambda,
        shuffle: shuffle ?? 'any',
    };
};

const generateSqlTemplate = (
    entityName: string,
    sourceCollections: Set<string> | string[],
    options?: TemplateOptions
) => {
    const existingTransforms = options?.existingTransforms;

    const existingMigrations = options?.existingMigrations;
    const templateFiles = options?.templateFiles;

    let transforms: Transform[] = [];

    if (existingTransforms && existingTransforms.length > 0) {
        transforms = existingTransforms.map(({ collection, lambda, shuffle }) =>
            formatSqlTransforms(
                collection,
                entityName,
                templateFiles,
                lambda,
                shuffle
            )
        );
    } else if (isArray(sourceCollections)) {
        transforms = sourceCollections.map((source) =>
            formatSqlTransforms(source, entityName, templateFiles)
        );
    } else {
        transforms = Array.from(sourceCollections).map((source) =>
            formatSqlTransforms(source, entityName, templateFiles)
        );
    }

    let sqlite: { migrations?: string[] } = {};

    if (existingMigrations && existingMigrations.length > 0) {
        sqlite = { migrations: existingMigrations };
    } else if (templateFiles) {
        sqlite = { migrations: [`${entityName}.migration.0.sql`] };
    }

    return {
        schema,
        key,
        derive: {
            // TODO (GitPod) what do we make this base here?
            //  there could be multiple bases
            using: { sqlite },
            transforms,
        },
    };
};

const formatTsTransforms = (source: string) => {
    const baseName = stripPathing(source);

    return {
        name: `${baseName}`,
        shuffle: 'any',
        source,
    };
};

const generateTsTemplate = (
    entityName: string,
    sourceCollections: Set<string> | string[]
) => {
    const transforms = isArray(sourceCollections)
        ? sourceCollections.map(formatTsTransforms)
        : Array.from(sourceCollections).map(formatTsTransforms);

    return {
        schema,
        key,
        derive: {
            using: { typescript: { module: `${entityName}.ts` } },
            transforms,
        },
    };
};

export const generateInitialSpec = (
    language: DerivationLanguage,
    entityName: string,
    sourceCollections: Set<string> | string[],
    options?: TemplateOptions
) => {
    const strippedEntityName = stripPathing(entityName);

    switch (language) {
        case 'typescript':
            return generateTsTemplate(strippedEntityName, sourceCollections);
        default:
            return generateSqlTemplate(
                strippedEntityName,
                sourceCollections,
                options
            );
    }
};

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
