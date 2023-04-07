import { stripPathing } from 'utils/misc-utils';

export type DerivationLanguage = 'sql' | 'typescript';

// Constants for part of the templates down below
const key = ['/your_key'];
const schema = {
    type: 'object',
    properties: { your_key: { type: 'string' } },
    required: ['your_key'],
};

// Need to make sure whatever name we pass in can be used in a file name
const makeNameSafeForFiles = (source: string) => {
    return source.replaceAll(/\//g, '_');
};

const generateSqlTemplate = (
    entityName: string,
    selectedCollectionSet: Set<string>
) => {
    const transforms = Array.from(selectedCollectionSet).map((source) => {
        const name = makeNameSafeForFiles(source);
        return {
            name: `${name}`,
            source,
            lambda: `${entityName}.lambda.${name}.sql`,
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
        const name = makeNameSafeForFiles(source);

        return {
            name: `${name}`,
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
