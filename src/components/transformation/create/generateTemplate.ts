import { stripPathing } from 'utils/misc-utils';

export type DerivationLanguage = 'sql' | 'typescript';

const key = ['/your_key'];
const schema = {
    type: 'object',
    properties: { your_key: { type: 'string' } },
    required: ['your_key'],
};

const makeNameSafe = (source: string) => {
    return source.replaceAll(/\//g, '_');
};

const generateSqlTemplate = (
    entityName: string,
    selectedCollectionSet: Set<string>
) => {
    const transforms = Array.from(selectedCollectionSet).map((source) => {
        const name = makeNameSafe(source);
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
        const name = makeNameSafe(source);

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

const generateTemplate = (
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

export default generateTemplate;
