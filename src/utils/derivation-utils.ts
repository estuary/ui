import { isArray } from 'lodash';
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
    transformName: string,
    newLambda: string,
    existingConfigs: TransformConfigDictionary
): Transform[] =>
    Object.values(existingConfigs).map(
        ({ name, collection, lambda, shuffle }): Transform => ({
            name,
            source: collection,
            lambda: transformName === name ? newLambda : lambda,
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
    version: number,
    shuffleKeys?: string[]
): TransformConfig => {
    const versionedTableName = `${stripPathing(source)}-v${version}`;

    return {
        filename: `${entityName}.lambda.${versionedTableName}.sql`,
        name: versionedTableName,
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
    entityName: string
): TransformConfigDictionary => {
    let compositeTransformConfigs: TransformConfigDictionary = {
        ...existingTransformConfigs,
    };

    selectedCollections.forEach((source, index) => {
        const compositeIndex = transformCount + index + 1;
        const tableName = stripPathing(source);

        const existingVersions = Object.values(compositeTransformConfigs)
            .filter(({ collection }) => stripPathing(collection) === tableName)
            .map(({ name }) => Number(name.slice(-1)))
            .sort();

        const versionNumber =
            existingVersions.length > 0
                ? existingVersions[existingVersions.length - 1] + 1
                : 0;

        compositeTransformConfigs = {
            ...compositeTransformConfigs,
            [`${entityName}.lambda.${compositeIndex}.sql`]:
                templateTransformConfig(source, entityName, versionNumber),
        };
    });

    return compositeTransformConfigs;
};
