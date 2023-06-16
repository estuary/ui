import { isArray } from 'lodash';
import { TransformConfig } from 'stores/TransformationCreate/types';
import { Transform, Transform_Shuffle } from 'types';
import { stripPathing } from 'utils/misc-utils';

export type DerivationLanguage = 'sql' | 'typescript';

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

const generateTransformSpec = (
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

export default generateTransformSpec;
