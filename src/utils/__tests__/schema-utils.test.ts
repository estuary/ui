import type { Schema } from 'src/types';

import {
    checkRedactionPointer,
    setSchemaProperties,
} from 'src/utils/schema-utils';

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

describe('checkRedactionPointer', () => {
    let expectedToBe = '';

    describe('returns "prevent"', () => {
        beforeEach(() => {
            expectedToBe = 'prevent';
        });

        test('when pointer is null', () => {
            expect(checkRedactionPointer(null)).toBe(expectedToBe);
        });

        test('when pointer is undefined', () => {
            expect(checkRedactionPointer(undefined)).toBe(expectedToBe);
        });

        test('when pointer is an empty string', () => {
            expect(checkRedactionPointer('')).toBe(expectedToBe);
        });

        test('when pointer is exactly "/_meta"', () => {
            expect(checkRedactionPointer('/_meta')).toBe(expectedToBe);
        });

        test('when pointer is exactly "/_meta/uuid"', () => {
            expect(checkRedactionPointer('/_meta/uuid')).toBe(expectedToBe);
        });
    });

    describe('returns "allowed"', () => {
        beforeEach(() => {
            expectedToBe = 'allowed';
        });

        describe('when pointer is within "/_meta/before"', () => {
            test('when pointer is exactly "/_meta/before"', () => {
                expect(checkRedactionPointer('/_meta/before')).toBe(
                    expectedToBe
                );
            });

            test('when pointer starts with "/_meta/before" and has additional segments', () => {
                expect(checkRedactionPointer('/_meta/before/foo')).toBe(
                    expectedToBe
                );
            });

            test('when pointer starts with "/_meta/before" with deeply nested path', () => {
                expect(checkRedactionPointer('/_meta/before/foo/bar/baz')).toBe(
                    expectedToBe
                );
            });

            test('when pointer starts with "/_meta/before" with escaped characters', () => {
                expect(checkRedactionPointer('/_meta/before/foo~1bar')).toBe(
                    expectedToBe
                );
            });
        });

        describe('when pointer is a normal field path', () => {
            test('when pointer is a simple top-level field', () => {
                expect(checkRedactionPointer('/foo')).toBe(expectedToBe);
            });

            test('when pointer is a nested field', () => {
                expect(checkRedactionPointer('/foo/bar')).toBe(expectedToBe);
            });

            test('when pointer is deeply nested', () => {
                expect(checkRedactionPointer('/foo/bar/baz/qux/quux')).toBe(
                    expectedToBe
                );
            });

            test('when pointer contains escaped characters', () => {
                expect(checkRedactionPointer('/foo~1bar')).toBe(expectedToBe);
            });

            test('when pointer contains multiple escaped segments', () => {
                expect(checkRedactionPointer('/foo~1bar/baz~1qux')).toBe(
                    expectedToBe
                );
            });
        });

        describe('edge cases', () => {
            test('when pointer has no leading slash', () => {
                expect(checkRedactionPointer('foo')).toBe(expectedToBe);
            });

            test('when pointer is just a slash', () => {
                expect(checkRedactionPointer('/')).toBe(expectedToBe);
            });

            test('when pointer has trailing slash', () => {
                expect(checkRedactionPointer('/foo/')).toBe(expectedToBe);
            });

            test('when pointer starts with multiple slashes', () => {
                expect(checkRedactionPointer('//foo')).toBe(expectedToBe);
            });

            test('when pointer is case-sensitive for "_meta"', () => {
                // The function uses startsWith and includes which are case-sensitive
                expect(checkRedactionPointer('/_Meta')).toBe(expectedToBe);
                expect(checkRedactionPointer('/_META')).toBe(expectedToBe);
            });

            test('when pointer is "/_meta/beforee" (extra char, still starts with allowed prefix)', () => {
                // This starts with "/_meta/before" so it's allowed
                expect(checkRedactionPointer('/_meta/beforee')).toBe(
                    expectedToBe
                );
            });

            test('when pointer contains spaces', () => {
                expect(checkRedactionPointer('/foo bar')).toBe(expectedToBe);
            });

            test('when pointer contains special characters', () => {
                expect(checkRedactionPointer('/foo-bar_baz.qux')).toBe(
                    expectedToBe
                );
            });
        });
    });

    describe('returns "warning"', () => {
        beforeEach(() => {
            expectedToBe = 'warning';
        });

        describe('when pointer starts with warning prefixes but is not prevented or allowed', () => {
            test('when pointer starts with "/_meta" but is not an exact prevent match', () => {
                expect(checkRedactionPointer('/_meta/foo')).toBe(expectedToBe);
            });

            test('when pointer starts with "/_meta" and has multiple segments', () => {
                expect(checkRedactionPointer('/_meta/foo/bar')).toBe(
                    expectedToBe
                );
            });

            test('when pointer starts with "/_meta/uuid" but has additional segments', () => {
                expect(checkRedactionPointer('/_meta/uuid/foo')).toBe(
                    expectedToBe
                );
            });

            test('when pointer is close to but not exactly a prevent match', () => {
                expect(checkRedactionPointer('/_meta/other')).toBe(
                    expectedToBe
                );
            });

            test('when pointer starts with "/_meta" with escaped characters', () => {
                expect(checkRedactionPointer('/_meta/foo~1bar')).toBe(
                    expectedToBe
                );
            });
        });

        describe('edge cases', () => {
            test('when pointer starts with "/_meta/befor" (missing last char)', () => {
                expect(checkRedactionPointer('/_meta/befor')).toBe(
                    expectedToBe
                );
            });
        });
    });
});
