import type { SourceCaptureDef } from 'src/types';

import { readSourceCaptureDefinitionFromSpec } from 'src/utils/entity-utils';

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
