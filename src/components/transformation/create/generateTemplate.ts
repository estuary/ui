import { stripPathing } from 'utils/misc-utils';

export type DerivationLanguage = 'sql' | 'typescript';

const key = ['/your_key'];
const schema = {
    type: 'object',
    properties: { your_key: { type: 'string' } },
    required: ['your_key'],
};

const makeNameSafe = (source: string) => {
    const name = source.replace(/[^a-z]/g, '_');

    // TODO (GitPod) what do we make this base here?
    //  Do we remove only the tenant portion of the name?
    //      or
    //  Do we remove everything up to the last part of the path
    //      or
    //  Do we make it some combo of those and add something to ensure it is unique for a user
    const base = stripPathing(source);

    return { name, base };
};

const generateSqlTemplate = (selectedCollectionSet: Set<string>) => {
    const transforms = Array.from(selectedCollectionSet).map((source) => {
        const { base, name } = makeNameSafe(source);
        return {
            name: `${name}`,
            source,
            lambda: `${base}.lambda.${name}.sql`,
        };
    });

    return {
        schema,
        key,
        derive: {
            // TODO (GitPod) what do we make this base here?
            //  there could be multiple bases
            using: { sqlite: { migrations: ['BASE.migration.0.sql'] } },
            transforms,
        },
    };
};

const generateTsTemplate = (selectedCollectionSet: Set<string>) => {
    const transforms = Array.from(selectedCollectionSet).map((source) => {
        const { name } = makeNameSafe(source);

        return {
            name: `${name}`,
            source,
        };
    });

    return {
        schema,
        key,
        derive: {
            // TODO (GitPod) what do we make this base here?
            //  there could be multiple bases
            using: { typescript: { module: 'BASE.ts' } },
            transforms,
        },
    };
};

const generateTemplate = (
    language: DerivationLanguage,
    selectedCollectionSet: Set<string>
) => {
    switch (language) {
        case 'typescript':
            return generateTsTemplate(selectedCollectionSet);
        default:
            return generateSqlTemplate(selectedCollectionSet);
    }
};

export default generateTemplate;
