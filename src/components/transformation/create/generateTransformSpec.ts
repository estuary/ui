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

const formatSqlTransforms = (
    source: string,
    entityName: string,
    lambda?: string,
    shuffle?: Transform_Shuffle
): Transform => {
    const tableName = stripPathing(source);

    return {
        name: tableName,
        source,
        lambda: lambda ? lambda : `${entityName}.lambda.${tableName}.sql`,
        shuffle: shuffle ?? 'any',
    };
};

const generateSqlTemplate = (
    entityName: string,
    sourceCollections: Set<string> | string[],
    existingTransforms?: TransformConfig[]
) => {
    let transforms: Transform[] = [];

    if (existingTransforms && existingTransforms.length > 0) {
        transforms = existingTransforms.map(({ collection, lambda, shuffle }) =>
            formatSqlTransforms(collection, entityName, lambda, shuffle)
        );
    } else if (isArray(sourceCollections)) {
        transforms = sourceCollections.map((source) =>
            formatSqlTransforms(source, entityName)
        );
    } else {
        transforms = Array.from(sourceCollections).map((source) =>
            formatSqlTransforms(source, entityName)
        );
    }

    return {
        schema,
        key,
        derive: {
            // TODO (GitPod) what do we make this base here?
            //  there could be multiple bases
            using: {
                sqlite: { migrations: [`${entityName}.migration.0.sql`] },
            },
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
    existingTransforms?: TransformConfig[]
) => {
    const strippedEntityName = stripPathing(entityName);

    switch (language) {
        case 'typescript':
            return generateTsTemplate(strippedEntityName, sourceCollections);
        default:
            return generateSqlTemplate(
                strippedEntityName,
                sourceCollections,
                existingTransforms
            );
    }
};

export default generateTransformSpec;
