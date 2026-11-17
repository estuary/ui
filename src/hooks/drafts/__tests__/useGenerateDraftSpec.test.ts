import type { ConnectorConfig } from 'deps/flow/flow';
import type {
    CaptureDraftSpec,
    MaterializationsDraftSpec,
} from 'src/hooks/drafts/useGetDraftSpec';
import type {
    ResourceConfig,
    ResourceConfigDictionary,
} from 'src/stores/Binding/types';
import type { SourceCaptureDef } from 'src/types';

import { renderHook } from '@testing-library/react';

import { useGenerateDraftSpec } from 'src/hooks/drafts/useGenerateDraftSpec';
import {
    generateMockConnectorConfig,
    generateMockResourceConfig,
} from 'src/test/test-utils';

const renderGenerators = () => ({
    capture: renderHook(() => useGenerateDraftSpec('capture')).result.current,
    materialization: renderHook(() => useGenerateDraftSpec('materialization'))
        .result.current,
});

// Plain data, as a mocked proxy gains spied props when lodash's isEmpty probes it
const mockResourceConfig = (
    collectionName: string,
    bindingIndex: number
): ResourceConfig => ({
    ...generateMockResourceConfig(collectionName, bindingIndex),
    data: { fiz: 'resource' },
});

describe('generating a task draft spec', () => {
    let uuidOne: string,
        uuidTwo: string,
        uuidThree: string,
        resourceConfig_one: ResourceConfig,
        resourceConfig_two: ResourceConfig,
        resourceConfig_three: ResourceConfig,
        connectorConfig: ConnectorConfig,
        resourceConfigs: ResourceConfigDictionary,
        existingCapture: CaptureDraftSpec | null,
        existingMaterialization: MaterializationsDraftSpec | null,
        sourceCaptureDefinition: SourceCaptureDef | null;

    let generateCaptureDraftSpec: ReturnType<
        typeof renderGenerators
    >['capture'];
    let generateMaterializationDraftSpec: ReturnType<
        typeof renderGenerators
    >['materialization'];

    beforeEach(() => {
        ({
            capture: generateCaptureDraftSpec,
            materialization: generateMaterializationDraftSpec,
        } = renderGenerators());

        uuidOne = crypto.randomUUID();
        uuidTwo = crypto.randomUUID();
        uuidThree = crypto.randomUUID();

        resourceConfig_one = mockResourceConfig('mock/binding/one', 0);
        resourceConfig_two = mockResourceConfig('mock/binding/two', 1);
        resourceConfig_three = mockResourceConfig('mock/binding/three', 2);

        connectorConfig = generateMockConnectorConfig();
        resourceConfigs = {};
        existingCapture = null;
        existingMaterialization = null;
        sourceCaptureDefinition = null;
    });

    const draftedCapture = (): CaptureDraftSpec => ({
        expect_pub_id: '00:00:00:00:00:00:00:00',
        spec: {
            bindings: [
                {
                    target: 'mock/binding/one',
                    resource: {
                        table: 'table_name',
                        delta_updates: false,
                    },
                },
                {
                    target: 'mock/binding/two',
                    resource: {
                        table: 'table_name_two',
                        delta_updates: false,
                    },
                    backfill: 2,
                },
            ],
            endpoint: {
                connector: connectorConfig,
            },
        } as any,
    });

    describe('when no existing data or binding data', () => {
        test('bindings will be empty', () => {
            const response = generateCaptureDraftSpec(
                null,
                connectorConfig,
                {},
                {}
            );
            expect(response.spec.bindings).toStrictEqual([]);
        });
    });

    describe('when existing data but no binding data', () => {
        beforeEach(() => {
            existingCapture = draftedCapture();
        });

        test('existing bindings will be cleaned out as they assume they were deleted', () => {
            const response = generateCaptureDraftSpec(
                existingCapture,
                connectorConfig,
                {},
                {}
            );
            expect(response.spec.bindings).toStrictEqual([]);
        });
    });

    describe('when existing data and new data', () => {
        beforeEach(() => {
            existingCapture = draftedCapture();
        });

        test('existing bindings will have their config overwritten and new ones added', () => {
            const response = generateCaptureDraftSpec(
                existingCapture,
                connectorConfig,
                {
                    [uuidOne]: resourceConfig_one,
                    [uuidTwo]: resourceConfig_two,
                    [uuidThree]: resourceConfig_three,
                },
                {
                    [resourceConfig_one.meta.collectionName]: [uuidOne],
                    [resourceConfig_two.meta.collectionName]: [uuidTwo],
                    [resourceConfig_three.meta.collectionName]: [uuidThree],
                }
            );
            expect(response.spec.bindings).toStrictEqual([
                {
                    resource: {
                        fiz: 'resource',
                    },
                    target: 'mock/binding/one',
                },
                {
                    backfill: 2,
                    resource: {
                        fiz: 'resource',
                    },
                    target: 'mock/binding/two',
                },
                {
                    resource: {
                        fiz: 'resource',
                    },
                    target: 'mock/binding/three',
                },
            ]);
        });

        describe('duplicates in existing bindings', () => {
            beforeEach(() => {
                const bindings = (existingCapture?.spec as any).bindings;
                bindings.push(bindings[0]);
                bindings.push(bindings[0]);
            });

            test('when the resource config contains a single instance of a duplicated binding, update one binding instance', () => {
                const response = generateCaptureDraftSpec(
                    existingCapture,
                    connectorConfig,
                    {
                        [uuidOne]: {
                            ...resourceConfig_one,
                            data: {
                                bar: 'updated',
                            },
                        },
                        [uuidTwo]: resourceConfig_two,
                    },
                    {
                        [resourceConfig_one.meta.collectionName]: [uuidOne],
                        [resourceConfig_two.meta.collectionName]: [uuidTwo],
                    }
                );

                expect(response.spec.bindings).toStrictEqual([
                    {
                        resource: { bar: 'updated' },
                        target: 'mock/binding/one',
                    },
                    {
                        resource: { fiz: 'resource' },
                        target: 'mock/binding/two',
                        backfill: 2,
                    },
                    {
                        resource: { delta_updates: false, table: 'table_name' },
                        target: 'mock/binding/one',
                    },
                    {
                        resource: { delta_updates: false, table: 'table_name' },
                        target: 'mock/binding/one',
                    },
                ]);
            });
        });
    });

    describe('entity type can alter what is returned', () => {
        beforeEach(() => {
            resourceConfigs = {
                [uuidOne]: resourceConfig_one,
                [uuidTwo]: resourceConfig_two,
            };
        });

        describe('when entity type is capture', () => {
            beforeEach(() => {
                existingCapture = draftedCapture();
            });

            test('`target` property is used to identify the associated collection', () => {
                expect(
                    (
                        generateCaptureDraftSpec(
                            existingCapture,
                            connectorConfig,
                            resourceConfigs,
                            {
                                [resourceConfig_one.meta.collectionName]: [
                                    uuidOne,
                                ],
                                [resourceConfig_two.meta.collectionName]: [
                                    uuidTwo,
                                ],
                            }
                        ).spec as any
                    ).bindings.map(({ target }: any) => target)
                ).toStrictEqual([
                    resourceConfig_one.meta.collectionName,
                    resourceConfig_two.meta.collectionName,
                ]);
            });
        });

        describe('when entity type is materialization', () => {
            beforeEach(() => {
                existingMaterialization = {
                    expect_pub_id: '00:00:00:00:00:00:00:00',
                    spec: {
                        bindings: [
                            {
                                source: 'mock/binding/one',
                                resource: {
                                    table: 'table_name',
                                    delta_updates: false,
                                },
                            },
                            {
                                source: 'mock/binding/two',
                                resource: {
                                    table: 'table_name_two',
                                    delta_updates: false,
                                },
                                backfill: 2,
                            },
                        ],
                        endpoint: {
                            connector: connectorConfig,
                        },
                    } as any,
                };
            });

            const generate = () =>
                generateMaterializationDraftSpec(
                    existingMaterialization,
                    connectorConfig,
                    resourceConfigs,
                    {
                        [resourceConfig_one.meta.collectionName]: [uuidOne],
                        [resourceConfig_two.meta.collectionName]: [uuidTwo],
                    },
                    { sourceCaptureDefinition }
                ).spec as any;

            test('`source` property is used to identify the associated collection', () => {
                expect(
                    generate().bindings.map(({ source }: any) => source)
                ).toStrictEqual([
                    resourceConfig_one.meta.collectionName,
                    resourceConfig_two.meta.collectionName,
                ]);
            });

            describe('if a sourceCaptureDefinition is provided', () => {
                beforeEach(() => {
                    sourceCaptureDefinition = {
                        capture: 'mock/source/capture',
                        deltaUpdates: false,
                        targetSchema: 'leaveEmpty',
                    };
                });

                test('will return the `source` property by default', () => {
                    expect(generate().source).toStrictEqual(
                        sourceCaptureDefinition
                    );
                });

                test('will use `sourceCapture` property if already defined', () => {
                    if (existingMaterialization) {
                        existingMaterialization = {
                            ...existingMaterialization,
                            spec: {
                                ...existingMaterialization.spec,
                                sourceCapture: {},
                            } as any,
                        };
                    }

                    expect(generate().sourceCapture).toStrictEqual(
                        sourceCaptureDefinition
                    );
                });
            });

            describe('if a sourceCaptureDefinition is not provided', () => {
                beforeEach(() => {
                    sourceCaptureDefinition = null;
                });

                test('will remove `source` and `sourceCapture` property if no definition is provided', () => {
                    if (existingMaterialization) {
                        existingMaterialization = {
                            ...existingMaterialization,
                            spec: {
                                ...existingMaterialization.spec,
                                source: 'foo',
                                sourceCapture: 'foo',
                            } as any,
                        };
                    }

                    const response = generate();

                    expect(response.source).toStrictEqual(undefined);
                    expect(response.sourceCapture).toStrictEqual(undefined);
                });
            });
        });
    });
    describe('draft spec fields and edge cases', () => {
        const NEW_PUB_ID = '00:00:00:00:00:00:00:00';
        const LIVE_PUB_ID = '16:86:68:55:a8:00:03:78';

        // Plain objects, so the drafted spec can be compared before and after
        const plainEndpoint = { image: 'source:dev', config: { sops: {} } };
        const plainDraftedCapture = (
            expectPubId: string | null
        ): CaptureDraftSpec => ({
            ...draftedCapture(),
            expect_pub_id: expectPubId,
            spec: {
                ...draftedCapture().spec,
                endpoint: { connector: plainEndpoint },
            } as any,
        });

        const bothBindings = () => ({
            [resourceConfig_one.meta.collectionName]: [uuidOne],
            [resourceConfig_two.meta.collectionName]: [uuidTwo],
        });

        test('a new capture expects no live spec and gets the starter defaults', () => {
            const response = generateCaptureDraftSpec(
                null,
                plainEndpoint,
                {},
                {}
            );

            expect(response.expect_pub_id).toBe(NEW_PUB_ID);
            expect((response.spec as any).autoDiscover).toEqual({
                addNewBindings: true,
                evolveIncompatibleCollections: true,
            });
        });

        test('a drafted capture keeps its precondition and gets no starter defaults', () => {
            const response = generateCaptureDraftSpec(
                plainDraftedCapture(LIVE_PUB_ID),
                plainEndpoint,
                {},
                {}
            );

            expect(response.expect_pub_id).toBe(LIVE_PUB_ID);
            expect((response.spec as any).autoDiscover).toBeUndefined();
        });

        test('a drafted capture with no precondition keeps none', () => {
            expect(
                generateCaptureDraftSpec(
                    plainDraftedCapture(null),
                    plainEndpoint,
                    {},
                    {}
                ).expect_pub_id
            ).toBeNull();
        });

        test('the drafted spec passed in is not changed', () => {
            const drafted = plainDraftedCapture(LIVE_PUB_ID);
            const before = JSON.stringify(drafted);

            generateCaptureDraftSpec(
                drafted,
                { image: 'source:dev', config: { sops: {}, rate: 9 } },
                {
                    [uuidOne]: {
                        ...resourceConfig_one,
                        data: { fiz: 'changed' },
                    },
                },
                { [resourceConfig_one.meta.collectionName]: [uuidOne] }
            );

            expect(JSON.stringify(drafted)).toBe(before);
        });

        test('a binding whose stored index is stale is matched by its collection', () => {
            // Binding two's index points at binding one's position
            const staleTwo = {
                ...resourceConfig_two,
                meta: { ...resourceConfig_two.meta, bindingIndex: 0 },
                data: { fiz: 'updated two' },
            };

            const bindings = (
                generateCaptureDraftSpec(
                    plainDraftedCapture(LIVE_PUB_ID),
                    plainEndpoint,
                    { [uuidOne]: resourceConfig_one, [uuidTwo]: staleTwo },
                    bothBindings()
                ).spec as any
            ).bindings;

            expect(bindings).toHaveLength(2);
            expect(bindings[0].target).toBe('mock/binding/one');
            expect(bindings[0].resource).toEqual({ fiz: 'resource' });
            expect(bindings[1].target).toBe('mock/binding/two');
            expect(bindings[1].resource).toEqual({ fiz: 'updated two' });
            // Fields the form doesn't manage are kept from the drafted binding
            expect(bindings[1].backfill).toBe(2);
        });

        test('disabling a binding sets `disable`, and enabling removes it', () => {
            const generate = (disable: boolean, drafted: CaptureDraftSpec) =>
                (
                    generateCaptureDraftSpec(
                        drafted,
                        plainEndpoint,
                        {
                            [uuidOne]: {
                                ...resourceConfig_one,
                                meta: { ...resourceConfig_one.meta, disable },
                            },
                        },
                        { [resourceConfig_one.meta.collectionName]: [uuidOne] }
                    ).spec as any
                ).bindings[0];

            const disabled = generate(true, plainDraftedCapture(LIVE_PUB_ID));
            expect(disabled.disable).toBe(true);

            const drafted = plainDraftedCapture(LIVE_PUB_ID);
            (drafted.spec as any).bindings[0].disable = true;
            expect(generate(false, drafted)).not.toHaveProperty('disable');
        });

        test('a Dekaf endpoint is written under `endpoint.dekaf`', () => {
            const dekaf = { variant: 'generic', config: { sops: {} } };

            const { endpoint } = generateMaterializationDraftSpec(
                null,
                dekaf as any,
                {},
                {}
            ).spec as any;

            expect(endpoint).toEqual({ dekaf });
        });

        test('omitted materialization options are removed from the drafted spec', () => {
            const drafted: MaterializationsDraftSpec = {
                expect_pub_id: LIVE_PUB_ID,
                spec: {
                    bindings: [],
                    endpoint: { connector: plainEndpoint },
                    sourceCapture: { capture: 'acmeCo/source' },
                    targetNaming: { strategy: 'singleSchema', schema: 'x' },
                    onIncompatibleSchemaChange: 'abort',
                } as any,
            };

            const spec = generateMaterializationDraftSpec(
                drafted,
                plainEndpoint,
                {},
                {}
            ).spec as any;

            expect(spec.sourceCapture).toBeUndefined();
            expect(spec.targetNaming).toBeUndefined();
            expect(spec.onIncompatibleSchemaChange).toBeUndefined();
        });
    });
});
