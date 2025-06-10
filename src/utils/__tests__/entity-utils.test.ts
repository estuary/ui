import type { Schema, SourceCaptureDef } from 'src/types';

import {
    getExistingPartition,
    readSourceCaptureDefinitionFromSpec,
} from 'src/utils/entity-utils';

describe('readSourceCaptureDefinitionFromSpec', () => {
    const oldKey = 'sourceCapture';
    const newKey = 'source';

    let capture: string, sourceCaptureDef: SourceCaptureDef;

    beforeEach(() => {
        capture = 'acmeCo/anvils';
        sourceCaptureDef = {
            capture,
        };
    });

    test(`returns null when no definition is found`, () => {
        expect(readSourceCaptureDefinitionFromSpec({})).toBe(null);
    });

    test(`returns an object when a string is found`, () => {
        expect(
            readSourceCaptureDefinitionFromSpec({
                [oldKey]: capture,
            })
        ).toStrictEqual(sourceCaptureDef);

        expect(
            readSourceCaptureDefinitionFromSpec({
                [newKey]: capture,
            })
        ).toStrictEqual(sourceCaptureDef);
    });

    describe(`returns an object`, () => {
        test(`when an object is found`, () => {
            expect(
                readSourceCaptureDefinitionFromSpec({
                    [oldKey]: sourceCaptureDef,
                })
            ).toStrictEqual(sourceCaptureDef);

            expect(
                readSourceCaptureDefinitionFromSpec({
                    [newKey]: sourceCaptureDef,
                })
            ).toStrictEqual(sourceCaptureDef);
        });

        test(`with all properties intact`, () => {
            beforeEach(() => {
                sourceCaptureDef = {
                    ...sourceCaptureDef,
                    deltaUpdates: true,
                    targetSchema: 'prefixNonDefaultSchema',
                };
            });

            expect(
                readSourceCaptureDefinitionFromSpec({
                    [oldKey]: sourceCaptureDef,
                })
            ).toStrictEqual(sourceCaptureDef);

            expect(
                readSourceCaptureDefinitionFromSpec({
                    [newKey]: sourceCaptureDef,
                })
            ).toStrictEqual(sourceCaptureDef);
        });

        test(`does not validate and will return ANY object`, () => {
            const randomObject = {
                foo: 'bar',
            };
            expect(
                readSourceCaptureDefinitionFromSpec({
                    [oldKey]: randomObject,
                })
            ).toStrictEqual(randomObject);

            expect(
                readSourceCaptureDefinitionFromSpec({
                    [newKey]: randomObject,
                })
            ).toStrictEqual(randomObject);
        });
    });
});

describe('getExistingPartition', () => {
    let spec: Schema = {};

    beforeEach(() => {
        spec = {
            schema: {
                $schema: 'https://json-schema.org/draft/2020-12/schema',
                properties: {
                    ts: {
                        type: 'string',
                        format: 'date-time',
                        title: 'Timestamp',
                        description:
                            'The time at which this message was generated',
                    },
                    message: {
                        type: 'string',
                        title: 'Message',
                        description: 'A human-readable message',
                    },
                },
                type: 'object',
                required: ['ts', 'message'],
                title: 'Example Output Record',
            },
            key: ['/ts'],
            projections: {
                message_fr: {
                    location: '/message',
                    partition: false,
                },
                ts_utc: {
                    location: '/ts',
                    partition: true,
                },
                ts_est: '/ts',
            },
        };
    });

    describe(`returns undefined`, () => {
        test(`when no projections are defined`, () => {
            delete spec.projections;

            expect(
                getExistingPartition(spec, '/message', 'message_en')
            ).toBeUndefined();
        });

        test(`when an existing projection for that field and/or location is not defined`, () => {
            expect(
                getExistingPartition(spec, '/message', 'message_en')
            ).toBeUndefined();

            expect(
                getExistingPartition(spec, '/fake_location', 'fake_location')
            ).toBeUndefined();
        });

        test(`when an existing projection is defined as a string`, () => {
            expect(getExistingPartition(spec, '/ts', 'ts_est')).toBeUndefined();
        });
    });

    test(`returns a boolean when an existing projection is defined as an object`, () => {
        expect(getExistingPartition(spec, '/ts', 'ts_utc')).toBe(true);

        expect(getExistingPartition(spec, '/message', 'message_fr')).toBe(
            false
        );
    });
});
