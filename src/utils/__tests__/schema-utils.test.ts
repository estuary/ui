import type { Schema } from 'src/types';

import { setSchemaProperties } from 'src/utils/schema-utils';

describe('setSchemaProperties', () => {
    let collectionSchema: Schema;

    describe('adds a properties object to the schema', () => {
        beforeEach(() => {
            collectionSchema = {
                $defs: {},
                $ref: 'flow://connector-schema',
            };
        });

        describe('with a redaction annotation defined one-degree deep', () => {
            test('when the pointer contains a single, non-escaped segment', () => {
                setSchemaProperties(collectionSchema, '/foo', {
                    id: 'redact',
                    value: { strategy: 'block' },
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        foo: {
                            redact: {
                                strategy: 'block',
                            },
                        },
                    },
                });
            });

            test('when the pointer contains a single, escaped segment', () => {
                setSchemaProperties(collectionSchema, '/foo~1bar', {
                    id: 'redact',
                    value: { strategy: 'block' },
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        'foo/bar': {
                            redact: {
                                strategy: 'block',
                            },
                        },
                    },
                });
            });
        });

        describe('with a redaction annotation removed one-degree deep', () => {
            test('when the pointer contains a single, non-escaped segment', () => {
                setSchemaProperties(collectionSchema, '/foo', {
                    id: 'redact',
                    value: undefined,
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        foo: {
                            redact: undefined,
                        },
                    },
                });
            });

            test('when the pointer contains a single, escaped segment', () => {
                setSchemaProperties(collectionSchema, '/foo~1bar', {
                    id: 'redact',
                    value: undefined,
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        'foo/bar': {
                            redact: undefined,
                        },
                    },
                });
            });
        });

        describe('with a redaction annotation defined two-degrees deep', () => {
            test('when the pointer contains two, non-escaped segments', () => {
                setSchemaProperties(collectionSchema, '/foo/bar', {
                    id: 'redact',
                    value: { strategy: 'block' },
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        foo: {
                            properties: {
                                bar: {
                                    redact: {
                                        strategy: 'block',
                                    },
                                },
                            },
                        },
                    },
                });
            });

            test('when the pointer contains one, non-escaped segment and one, escaped segment', () => {
                setSchemaProperties(collectionSchema, '/foo/bar~1baz', {
                    id: 'redact',
                    value: { strategy: 'block' },
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        foo: {
                            properties: {
                                'bar/baz': {
                                    redact: {
                                        strategy: 'block',
                                    },
                                },
                            },
                        },
                    },
                });

                collectionSchema = {
                    $defs: {},
                    $ref: 'flow://connector-schema',
                };

                setSchemaProperties(collectionSchema, '/foo~1bar/baz', {
                    id: 'redact',
                    value: { strategy: 'block' },
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        'foo/bar': {
                            properties: {
                                baz: {
                                    redact: {
                                        strategy: 'block',
                                    },
                                },
                            },
                        },
                    },
                });
            });

            test('when the pointer contains two, escaped segments', () => {
                setSchemaProperties(collectionSchema, '/foo~1bar/baz~1qux', {
                    id: 'redact',
                    value: { strategy: 'block' },
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        'foo/bar': {
                            properties: {
                                'baz/qux': {
                                    redact: {
                                        strategy: 'block',
                                    },
                                },
                            },
                        },
                    },
                });
            });
        });

        describe('with a redaction annotation removed two-degrees deep', () => {
            test('when the pointer contains two, non-escaped segments', () => {
                setSchemaProperties(collectionSchema, '/foo/bar', {
                    id: 'redact',
                    value: undefined,
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        foo: {
                            properties: {
                                bar: {
                                    redact: undefined,
                                },
                            },
                        },
                    },
                });
            });

            test('when the pointer contains one, non-escaped segment and one, escaped segment', () => {
                setSchemaProperties(collectionSchema, '/foo/bar~1baz', {
                    id: 'redact',
                    value: undefined,
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        foo: {
                            properties: {
                                'bar/baz': {
                                    redact: undefined,
                                },
                            },
                        },
                    },
                });

                collectionSchema = {
                    $defs: {},
                    $ref: 'flow://connector-schema',
                };

                setSchemaProperties(collectionSchema, '/foo~1bar/baz', {
                    id: 'redact',
                    value: undefined,
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        'foo/bar': {
                            properties: {
                                baz: {
                                    redact: undefined,
                                },
                            },
                        },
                    },
                });
            });

            test('when the pointer contains two, escaped segments', () => {
                setSchemaProperties(collectionSchema, '/foo~1bar/baz~1qux', {
                    id: 'redact',
                    value: undefined,
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        'foo/bar': {
                            properties: {
                                'baz/qux': {
                                    redact: undefined,
                                },
                            },
                        },
                    },
                });
            });
        });

        describe('with a redaction annotation defined five-degrees deep', () => {
            test('when the pointer contains five, non-escaped segments', () => {
                setSchemaProperties(collectionSchema, '/foo/bar/baz/qux/quux', {
                    id: 'redact',
                    value: { strategy: 'block' },
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        foo: {
                            properties: {
                                bar: {
                                    properties: {
                                        baz: {
                                            properties: {
                                                qux: {
                                                    properties: {
                                                        quux: {
                                                            redact: {
                                                                strategy:
                                                                    'block',
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
            });

            test('when the pointer contains a mix of five, non-escaped and escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo/bar~1baz/qux/quux~1corge/grault',
                    {
                        id: 'redact',
                        value: { strategy: 'block' },
                    }
                );

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        foo: {
                            properties: {
                                'bar/baz': {
                                    properties: {
                                        qux: {
                                            properties: {
                                                'quux/corge': {
                                                    properties: {
                                                        grault: {
                                                            redact: {
                                                                strategy:
                                                                    'block',
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });

                collectionSchema = {
                    $defs: {},
                    $ref: 'flow://connector-schema',
                };

                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar~1baz/qux/quux/corge/grault~1garply',
                    {
                        id: 'redact',
                        value: { strategy: 'block' },
                    }
                );

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        'foo/bar/baz': {
                            properties: {
                                qux: {
                                    properties: {
                                        quux: {
                                            properties: {
                                                corge: {
                                                    properties: {
                                                        'grault/garply': {
                                                            redact: {
                                                                strategy:
                                                                    'block',
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
            });

            test('when the pointer contains five, escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar/baz~1qux~1quux~1corge/grault~1garply/waldo~1fred~1plugh/xyzzy~1thud',
                    {
                        id: 'redact',
                        value: { strategy: 'block' },
                    }
                );

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        'foo/bar': {
                            properties: {
                                'baz/qux/quux/corge': {
                                    properties: {
                                        'grault/garply': {
                                            properties: {
                                                'waldo/fred/plugh': {
                                                    properties: {
                                                        'xyzzy/thud': {
                                                            redact: {
                                                                strategy:
                                                                    'block',
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
            });
        });

        describe('with a redaction annotation removed five-degrees deep', () => {
            test('when the pointer contains five, non-escaped segments', () => {
                setSchemaProperties(collectionSchema, '/foo/bar/baz/qux/quux', {
                    id: 'redact',
                    value: undefined,
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        foo: {
                            properties: {
                                bar: {
                                    properties: {
                                        baz: {
                                            properties: {
                                                qux: {
                                                    properties: {
                                                        quux: {
                                                            redact: undefined,
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
            });

            test('when the pointer contains a mix of five, non-escaped and escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo/bar~1baz/qux/quux~1corge/grault',
                    {
                        id: 'redact',
                        value: undefined,
                    }
                );

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        foo: {
                            properties: {
                                'bar/baz': {
                                    properties: {
                                        qux: {
                                            properties: {
                                                'quux/corge': {
                                                    properties: {
                                                        grault: {
                                                            redact: undefined,
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });

                collectionSchema = {
                    $defs: {},
                    $ref: 'flow://connector-schema',
                };

                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar~1baz/qux/quux/corge/grault~1garply',
                    {
                        id: 'redact',
                        value: undefined,
                    }
                );

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        'foo/bar/baz': {
                            properties: {
                                qux: {
                                    properties: {
                                        quux: {
                                            properties: {
                                                corge: {
                                                    properties: {
                                                        'grault/garply': {
                                                            redact: undefined,
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
            });

            test('when the pointer contains five, escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar/baz~1qux~1quux~1corge/grault~1garply/waldo~1fred~1plugh/xyzzy~1thud',
                    {
                        id: 'redact',
                        value: undefined,
                    }
                );

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        'foo/bar': {
                            properties: {
                                'baz/qux/quux/corge': {
                                    properties: {
                                        'grault/garply': {
                                            properties: {
                                                'waldo/fred/plugh': {
                                                    properties: {
                                                        'xyzzy/thud': {
                                                            redact: undefined,
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
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
            collectionSchema = {
                $defs: {},
                $ref: 'flow://connector-schema',
                properties: { ...schemaProperties },
            };
        });

        describe('with a redaction annotation defined one-degree deep', () => {
            test('when the pointer contains a single, non-escaped segment', () => {
                setSchemaProperties(collectionSchema, '/foo', {
                    id: 'redact',
                    value: { strategy: 'block' },
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        ...schemaProperties,
                        foo: {
                            redact: {
                                strategy: 'block',
                            },
                        },
                    },
                });
            });

            test('when the pointer contains a single, escaped segment', () => {
                setSchemaProperties(collectionSchema, '/foo~1bar', {
                    id: 'redact',
                    value: { strategy: 'block' },
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        ...schemaProperties,
                        'foo/bar': {
                            redact: {
                                strategy: 'block',
                            },
                        },
                    },
                });
            });
        });

        describe('with a redaction annotation removed one-degree deep', () => {
            test('when the pointer contains a single, non-escaped segment', () => {
                setSchemaProperties(collectionSchema, '/foo', {
                    id: 'redact',
                    value: undefined,
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        ...schemaProperties,
                        foo: {
                            redact: undefined,
                        },
                    },
                });
            });

            test('when the pointer contains a single, escaped segment', () => {
                setSchemaProperties(collectionSchema, '/foo~1bar', {
                    id: 'redact',
                    value: undefined,
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        ...schemaProperties,
                        'foo/bar': {
                            redact: undefined,
                        },
                    },
                });
            });
        });

        describe('with a redaction annotation defined two-degrees deep', () => {
            test('when the pointer contains two, non-escaped segments', () => {
                setSchemaProperties(collectionSchema, '/foo/bar', {
                    id: 'redact',
                    value: { strategy: 'block' },
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        ...schemaProperties,
                        foo: {
                            properties: {
                                bar: {
                                    redact: {
                                        strategy: 'block',
                                    },
                                },
                            },
                        },
                    },
                });
            });

            test('when the pointer contains one, non-escaped segment and one, escaped segment', () => {
                setSchemaProperties(collectionSchema, '/foo/bar~1baz', {
                    id: 'redact',
                    value: { strategy: 'block' },
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        ...schemaProperties,
                        foo: {
                            properties: {
                                'bar/baz': {
                                    redact: {
                                        strategy: 'block',
                                    },
                                },
                            },
                        },
                    },
                });

                collectionSchema = {
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: { ...schemaProperties },
                };

                setSchemaProperties(collectionSchema, '/foo~1bar/baz', {
                    id: 'redact',
                    value: { strategy: 'block' },
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        ...schemaProperties,
                        'foo/bar': {
                            properties: {
                                baz: {
                                    redact: {
                                        strategy: 'block',
                                    },
                                },
                            },
                        },
                    },
                });
            });

            test('when the pointer contains two, escaped segments', () => {
                setSchemaProperties(collectionSchema, '/foo~1bar/baz~1qux', {
                    id: 'redact',
                    value: { strategy: 'block' },
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        ...schemaProperties,
                        'foo/bar': {
                            properties: {
                                'baz/qux': {
                                    redact: {
                                        strategy: 'block',
                                    },
                                },
                            },
                        },
                    },
                });
            });
        });

        describe('with a redaction annotation removed two-degrees deep', () => {
            test('when the pointer contains two, non-escaped segments', () => {
                setSchemaProperties(collectionSchema, '/foo/bar', {
                    id: 'redact',
                    value: undefined,
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        ...schemaProperties,
                        foo: {
                            properties: {
                                bar: {
                                    redact: undefined,
                                },
                            },
                        },
                    },
                });
            });

            test('when the pointer contains one, non-escaped segment and one, escaped segment', () => {
                setSchemaProperties(collectionSchema, '/foo/bar~1baz', {
                    id: 'redact',
                    value: undefined,
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        ...schemaProperties,
                        foo: {
                            properties: {
                                'bar/baz': {
                                    redact: undefined,
                                },
                            },
                        },
                    },
                });

                collectionSchema = {
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: { ...schemaProperties },
                };

                setSchemaProperties(collectionSchema, '/foo~1bar/baz', {
                    id: 'redact',
                    value: undefined,
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        ...schemaProperties,
                        'foo/bar': {
                            properties: {
                                baz: {
                                    redact: undefined,
                                },
                            },
                        },
                    },
                });
            });

            test('when the pointer contains two, escaped segments', () => {
                setSchemaProperties(collectionSchema, '/foo~1bar/baz~1qux', {
                    id: 'redact',
                    value: undefined,
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        ...schemaProperties,
                        'foo/bar': {
                            properties: {
                                'baz/qux': {
                                    redact: undefined,
                                },
                            },
                        },
                    },
                });
            });
        });

        describe('with a redaction annotation defined five-degrees deep', () => {
            test('when the pointer contains five, non-escaped segments', () => {
                setSchemaProperties(collectionSchema, '/foo/bar/baz/qux/quux', {
                    id: 'redact',
                    value: { strategy: 'block' },
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        ...schemaProperties,
                        foo: {
                            properties: {
                                bar: {
                                    properties: {
                                        baz: {
                                            properties: {
                                                qux: {
                                                    properties: {
                                                        quux: {
                                                            redact: {
                                                                strategy:
                                                                    'block',
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
            });

            test('when the pointer contains a mix of five, non-escaped and escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo/bar~1baz/qux/quux~1corge/grault',
                    {
                        id: 'redact',
                        value: { strategy: 'block' },
                    }
                );

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        ...schemaProperties,
                        foo: {
                            properties: {
                                'bar/baz': {
                                    properties: {
                                        qux: {
                                            properties: {
                                                'quux/corge': {
                                                    properties: {
                                                        grault: {
                                                            redact: {
                                                                strategy:
                                                                    'block',
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });

                collectionSchema = {
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: { ...schemaProperties },
                };

                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar~1baz/qux/quux/corge/grault~1garply',
                    {
                        id: 'redact',
                        value: { strategy: 'block' },
                    }
                );

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        ...schemaProperties,
                        'foo/bar/baz': {
                            properties: {
                                qux: {
                                    properties: {
                                        quux: {
                                            properties: {
                                                corge: {
                                                    properties: {
                                                        'grault/garply': {
                                                            redact: {
                                                                strategy:
                                                                    'block',
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
            });

            test('when the pointer contains five, escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar/baz~1qux~1quux~1corge/grault~1garply/waldo~1fred~1plugh/xyzzy~1thud',
                    {
                        id: 'redact',
                        value: { strategy: 'block' },
                    }
                );

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        ...schemaProperties,
                        'foo/bar': {
                            properties: {
                                'baz/qux/quux/corge': {
                                    properties: {
                                        'grault/garply': {
                                            properties: {
                                                'waldo/fred/plugh': {
                                                    properties: {
                                                        'xyzzy/thud': {
                                                            redact: {
                                                                strategy:
                                                                    'block',
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
            });
        });

        describe('with a redaction annotation removed five-degrees deep', () => {
            test('when the pointer contains five, non-escaped segments', () => {
                setSchemaProperties(collectionSchema, '/foo/bar/baz/qux/quux', {
                    id: 'redact',
                    value: undefined,
                });

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        ...schemaProperties,
                        foo: {
                            properties: {
                                bar: {
                                    properties: {
                                        baz: {
                                            properties: {
                                                qux: {
                                                    properties: {
                                                        quux: {
                                                            redact: undefined,
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
            });

            test('when the pointer contains a mix of five, non-escaped and escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo/bar~1baz/qux/quux~1corge/grault',
                    {
                        id: 'redact',
                        value: undefined,
                    }
                );

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        ...schemaProperties,
                        foo: {
                            properties: {
                                'bar/baz': {
                                    properties: {
                                        qux: {
                                            properties: {
                                                'quux/corge': {
                                                    properties: {
                                                        grault: {
                                                            redact: undefined,
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });

                collectionSchema = {
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: { ...schemaProperties },
                };

                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar~1baz/qux/quux/corge/grault~1garply',
                    {
                        id: 'redact',
                        value: undefined,
                    }
                );

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        ...schemaProperties,
                        'foo/bar/baz': {
                            properties: {
                                qux: {
                                    properties: {
                                        quux: {
                                            properties: {
                                                corge: {
                                                    properties: {
                                                        'grault/garply': {
                                                            redact: undefined,
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
            });

            test('when the pointer contains five, escaped segments', () => {
                setSchemaProperties(
                    collectionSchema,
                    '/foo~1bar/baz~1qux~1quux~1corge/grault~1garply/waldo~1fred~1plugh/xyzzy~1thud',
                    {
                        id: 'redact',
                        value: undefined,
                    }
                );

                expect(collectionSchema).toStrictEqual({
                    $defs: {},
                    $ref: 'flow://connector-schema',
                    properties: {
                        ...schemaProperties,
                        'foo/bar': {
                            properties: {
                                'baz/qux/quux/corge': {
                                    properties: {
                                        'grault/garply': {
                                            properties: {
                                                'waldo/fred/plugh': {
                                                    properties: {
                                                        'xyzzy/thud': {
                                                            redact: undefined,
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
            });
        });
    });
});
