import { stripPathing } from 'utils/misc-utils';

export type DerivationLanguage = 'sql' | 'typescript';

// Constants for part of the templates down below
const key = ['/your_key'];
const schema = {
    type: 'object',
    properties: { your_key: { type: 'string' } },
    required: ['your_key'],
};

const generateSqlTemplate = (
    entityName: string,
    selectedCollectionSet: Set<string>
) => {
    const transforms = Array.from(selectedCollectionSet).map((source) => {
        const baseName = stripPathing(source);

        return {
            name: `${baseName}`,
            shuffle: 'any',
            source,
            lambda: `${entityName}.lambda.${baseName}.sql`,
        };
    });

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

const generateTsTemplate = (
    entityName: string,
    selectedCollectionSet: Set<string>
) => {
    const transforms = Array.from(selectedCollectionSet).map((source) => {
        const baseName = stripPathing(source);

        return {
            name: `${baseName}`,
            shuffle: 'any',
            source,
        };
    });

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
    selectedCollectionSet: Set<string>
) => {
    const strippedEntityName = stripPathing(entityName);

    switch (language) {
        case 'typescript':
            return generateTsTemplate(
                strippedEntityName,
                selectedCollectionSet
            );
        default:
            return generateSqlTemplate(
                strippedEntityName,
                selectedCollectionSet
            );
    }
};

export default generateTransformSpec;
