import type { Schema } from 'src/types';
import type { SetSchemaPropertiesTarget } from 'src/utils/types';

import { setSchemaProperties } from 'src/utils/schema-utils';

const getDefaultSchema = (schemaProperties?: any): Schema => {
    let response: Schema = {
        $defs: {},
        $ref: 'flow://connector-schema',
    };

    if (schemaProperties) {
        response = {
            ...response,
            properties: { ...schemaProperties },
        };
    }

    return response;
};

describe('setSchemaProperties:redact', () => {
    const redactBase: SetSchemaPropertiesTarget = {
        id: 'redact',
        value: undefined,
    };

    let collectionSchema: Schema;

    let redactRemove: SetSchemaPropertiesTarget;

    let redactBlock: SetSchemaPropertiesTarget;

    beforeEach(() => {
        redactRemove = {
            ...redactBase,
            value: undefined,
        };

        redactBlock = {
            ...redactBase,
            value: { strategy: 'block' },
        };
    });

    describe('adds a properties object to the schema', () => {
        beforeEach(() => {
            collectionSchema = getDefaultSchema();
        });

        describe('with a redaction annotation defined one-degree deep', () => {
            test('when the pointer contains a single, non-escaped segment', () => {
                setSchemaProperties(collectionSchema, '/foo', redactBlock);

                expect(collectionSchema).toMatchSnapshot();
            });

            test('when the pointer contains a single, escaped segment', () => {
                setSchemaProperties(collectionSchema, '/foo~1bar', redactBlock);

                expect(collectionSchema).toMatchSnapshot();
            });
        });

        describe('with a redaction annotation removed one-degree deep', () => {
            test('when the pointer contains a single, non-escaped segment', () => {
                setSchemaProperties(collectionSchema, '/foo', redactRemove);

                expect(collectionSchema).toMatchSnapshot();
            });

            test('when the pointer contains a single, escaped segment', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar',
                    redactRemove
                );

                expect(collectionSchema).toMatchSnapshot();
            });
        });

        describe('with a redaction annotation defined two-degrees deep', () => {
            test('when the pointer contains two, non-escaped segments', () => {
                setSchemaProperties(collectionSchema, '/foo/bar', redactBlock);

                expect(collectionSchema).toMatchSnapshot();
            });

            test('when the pointer contains one, non-escaped segment and one, escaped segment', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo/bar~1baz',
                    redactBlock
                );

                expect(collectionSchema).toMatchSnapshot();

                collectionSchema = getDefaultSchema();

                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar/baz',
                    redactBlock
                );

                expect(collectionSchema).toMatchSnapshot();
            });

            test('when the pointer contains two, escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar/baz~1qux',
                    redactBlock
                );

                expect(collectionSchema).toMatchSnapshot();
            });
        });

        describe('with a redaction annotation removed two-degrees deep', () => {
            test('when the pointer contains two, non-escaped segments', () => {
                setSchemaProperties(collectionSchema, '/foo/bar', redactRemove);

                expect(collectionSchema).toMatchSnapshot();
            });

            test('when the pointer contains one, non-escaped segment and one, escaped segment', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo/bar~1baz',
                    redactRemove
                );

                expect(collectionSchema).toMatchSnapshot();

                collectionSchema = getDefaultSchema();

                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar/baz',
                    redactRemove
                );

                expect(collectionSchema).toMatchSnapshot();
            });

            test('when the pointer contains two, escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar/baz~1qux',
                    redactRemove
                );

                expect(collectionSchema).toMatchSnapshot();
            });
        });

        describe('with a redaction annotation defined five-degrees deep', () => {
            test('when the pointer contains five, non-escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo/bar/baz/qux/quux',
                    redactBlock
                );

                expect(collectionSchema).toMatchSnapshot();
            });

            test('when the pointer contains a mix of five, non-escaped and escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo/bar~1baz/qux/quux~1corge/grault',
                    redactBlock
                );

                expect(collectionSchema).toMatchSnapshot();

                collectionSchema = getDefaultSchema();

                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar~1baz/qux/quux/corge/grault~1garply',
                    redactBlock
                );

                expect(collectionSchema).toMatchSnapshot();
            });

            test('when the pointer contains five, escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar/baz~1qux~1quux~1corge/grault~1garply/waldo~1fred~1plugh/xyzzy~1thud',
                    redactBlock
                );

                expect(collectionSchema).toMatchSnapshot();
            });
        });

        describe('with a redaction annotation removed five-degrees deep', () => {
            test('when the pointer contains five, non-escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo/bar/baz/qux/quux',
                    redactRemove
                );

                expect(collectionSchema).toMatchSnapshot();
            });

            test('when the pointer contains a mix of five, non-escaped and escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo/bar~1baz/qux/quux~1corge/grault',
                    redactRemove
                );

                expect(collectionSchema).toMatchSnapshot();

                collectionSchema = getDefaultSchema();

                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar~1baz/qux/quux/corge/grault~1garply',
                    redactRemove
                );

                expect(collectionSchema).toMatchSnapshot();
            });

            test('when the pointer contains five, escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar/baz~1qux~1quux~1corge/grault~1garply/waldo~1fred~1plugh/xyzzy~1thud',
                    redactRemove
                );

                expect(collectionSchema).toMatchSnapshot();
            });
        });
    });

    describe('updates a properties object on the schema', () => {
        const schemaProperties: Schema = {
            random_a: 'some_string',
            random_b: 1,
            random_c: false,
            random_d: {
                properties: {},
                random_d_i: true,
                random_d_ii: {
                    random_d_ii_a: 'another_string',
                },
            },
            random_e: {
                random_e_i: 142,
            },
        };

        beforeEach(() => {
            collectionSchema = getDefaultSchema(schemaProperties);
        });

        describe('with a redaction annotation defined one-degree deep', () => {
            test('when the pointer contains a single, non-escaped segment', () => {
                setSchemaProperties(collectionSchema, '/foo', redactBlock);

                expect(collectionSchema).toMatchSnapshot();
            });

            test('when the pointer contains a single, escaped segment', () => {
                setSchemaProperties(collectionSchema, '/foo~1bar', redactBlock);

                expect(collectionSchema).toMatchSnapshot();
            });
        });

        describe('with a redaction annotation removed one-degree deep', () => {
            test('when the pointer contains a single, non-escaped segment', () => {
                setSchemaProperties(collectionSchema, '/foo', redactRemove);

                expect(collectionSchema).toMatchSnapshot();
            });

            test('when the pointer contains a single, escaped segment', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar',
                    redactRemove
                );

                expect(collectionSchema).toMatchSnapshot();
            });
        });

        describe('with a redaction annotation defined two-degrees deep', () => {
            test('when the pointer contains two, non-escaped segments', () => {
                setSchemaProperties(collectionSchema, '/foo/bar', redactBlock);

                expect(collectionSchema).toMatchSnapshot();
            });

            test('when the pointer contains one, non-escaped segment and one, escaped segment', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo/bar~1baz',
                    redactBlock
                );

                expect(collectionSchema).toMatchSnapshot();

                collectionSchema = getDefaultSchema(schemaProperties);

                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar/baz',
                    redactBlock
                );

                expect(collectionSchema).toMatchSnapshot();
            });

            test('when the pointer contains two, escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar/baz~1qux',
                    redactBlock
                );

                expect(collectionSchema).toMatchSnapshot();
            });
        });

        describe('with a redaction annotation removed two-degrees deep', () => {
            test('when the pointer contains two, non-escaped segments', () => {
                setSchemaProperties(collectionSchema, '/foo/bar', redactRemove);

                expect(collectionSchema).toMatchSnapshot();
            });

            test('when the pointer contains one, non-escaped segment and one, escaped segment', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo/bar~1baz',
                    redactRemove
                );

                expect(collectionSchema).toMatchSnapshot();

                collectionSchema = getDefaultSchema(schemaProperties);

                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar/baz',
                    redactRemove
                );

                expect(collectionSchema).toMatchSnapshot();
            });

            test('when the pointer contains two, escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar/baz~1qux',
                    redactRemove
                );

                expect(collectionSchema).toMatchSnapshot();
            });
        });

        describe('with a redaction annotation defined five-degrees deep', () => {
            test('when the pointer contains five, non-escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo/bar/baz/qux/quux',
                    redactBlock
                );

                expect(collectionSchema).toMatchSnapshot();
            });

            test('when the pointer contains a mix of five, non-escaped and escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo/bar~1baz/qux/quux~1corge/grault',
                    redactBlock
                );

                expect(collectionSchema).toMatchSnapshot();

                collectionSchema = getDefaultSchema(schemaProperties);

                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar~1baz/qux/quux/corge/grault~1garply',
                    redactBlock
                );

                expect(collectionSchema).toMatchSnapshot();
            });

            test('when the pointer contains five, escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar/baz~1qux~1quux~1corge/grault~1garply/waldo~1fred~1plugh/xyzzy~1thud',
                    redactBlock
                );

                expect(collectionSchema).toMatchSnapshot();
            });
        });

        describe('with a redaction annotation removed five-degrees deep', () => {
            test('when the pointer contains five, non-escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo/bar/baz/qux/quux',
                    redactRemove
                );

                expect(collectionSchema).toMatchSnapshot();
            });

            test('when the pointer contains a mix of five, non-escaped and escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo/bar~1baz/qux/quux~1corge/grault',
                    redactRemove
                );

                expect(collectionSchema).toMatchSnapshot();

                collectionSchema = getDefaultSchema(schemaProperties);

                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar~1baz/qux/quux/corge/grault~1garply',
                    redactRemove
                );

                expect(collectionSchema).toMatchSnapshot();
            });

            test('when the pointer contains five, escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar/baz~1qux~1quux~1corge/grault~1garply/waldo~1fred~1plugh/xyzzy~1thud',
                    redactRemove
                );

                expect(collectionSchema).toMatchSnapshot();
            });
        });
    });
});

describe('setSchemaProperties:default', () => {
    const defaultBase: SetSchemaPropertiesTarget = {
        id: 'default',
        value: undefined,
    };

    let collectionSchema: Schema;
    let defaultUndefined: SetSchemaPropertiesTarget;
    let defaultString: SetSchemaPropertiesTarget;
    let defaultNumber: SetSchemaPropertiesTarget;
    let defaultBoolean: SetSchemaPropertiesTarget;

    beforeEach(() => {
        defaultUndefined = { ...defaultBase, value: undefined };
        defaultString = { ...defaultBase, value: 'mock value' };
        defaultNumber = { ...defaultBase, value: 123 };
        defaultBoolean = { ...defaultBase, value: true };

        collectionSchema = getDefaultSchema();
    });

    test('handles different types', () => {
        setSchemaProperties(collectionSchema, '/foo', defaultUndefined);
        expect(collectionSchema).toMatchSnapshot();
        collectionSchema = getDefaultSchema();

        setSchemaProperties(collectionSchema, '/foo', defaultString);
        expect(collectionSchema).toMatchSnapshot();
        collectionSchema = getDefaultSchema();

        setSchemaProperties(collectionSchema, '/foo', defaultNumber);
        expect(collectionSchema).toMatchSnapshot();
        collectionSchema = getDefaultSchema();

        setSchemaProperties(collectionSchema, '/foo', defaultBoolean);
        expect(collectionSchema).toMatchSnapshot();
    });
});
