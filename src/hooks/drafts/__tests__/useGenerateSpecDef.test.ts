import type {
    CaptureDef,
    ConnectorConfig,
    MaterializationDef,
} from 'deps/flow/flow';
import type {
    ResourceConfig,
    ResourceConfigDictionary,
} from 'src/stores/Binding/types';
import type { SourceCaptureDef } from 'src/types';

import { renderHook } from '@testing-library/react';

import { useGenerateSpecDef } from 'src/hooks/drafts/useGenerateSpecDef';
import {
    generateMockConnectorConfig,
    generateMockResourceConfig,
} from 'src/test/test-utils';

const renderGenerators = () => ({
    capture: renderHook(() => useGenerateSpecDef('capture')).result.current,
    materialization: renderHook(() => useGenerateSpecDef('materialization'))
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

describe('generating a task spec def', () => {
    let uuidOne: string,
        uuidTwo: string,
        uuidThree: string,
        resourceConfig_one: ResourceConfig,
        resourceConfig_two: ResourceConfig,
        resourceConfig_three: ResourceConfig,
        connectorConfig: ConnectorConfig,
        resourceConfigs: ResourceConfigDictionary,
        existingCapture: CaptureDef | null,
        existingMaterialization: MaterializationDef | null,
        sourceCaptureDefinition: SourceCaptureDef | null;

    let generateCaptureSpecDef: ReturnType<typeof renderGenerators>['capture'];
    let generateMaterializationSpecDef: ReturnType<
        typeof renderGenerators
    >['materialization'];

    beforeEach(() => {
        ({
            capture: generateCaptureSpecDef,
            materialization: generateMaterializationSpecDef,
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

    const draftedCapture = (): CaptureDef =>
        ({
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
        }) as any;

    describe('when no existing data or binding data', () => {
        test('bindings will be empty', () => {
            const response = generateCaptureSpecDef(
                null,
                connectorConfig,
                {},
                {}
            );
            expect(response.bindings).toStrictEqual([]);
        });
    });

    describe('when existing data but no binding data', () => {
        beforeEach(() => {
            existingCapture = draftedCapture();
        });

        test('existing bindings will be cleaned out as they assume they were deleted', () => {
            const response = generateCaptureSpecDef(
                existingCapture,
                connectorConfig,
                {},
                {}
            );
            expect(response.bindings).toStrictEqual([]);
        });
    });

    describe('when existing data and new data', () => {
        beforeEach(() => {
            existingCapture = draftedCapture();
        });

        test('existing bindings will have their config overwritten and new ones added', () => {
            const response = generateCaptureSpecDef(
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
            expect(response.bindings).toStrictEqual([
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
                const { bindings } = existingCapture as any;
                bindings.push(bindings[0]);
                bindings.push(bindings[0]);
            });

            test('when the resource config contains a single instance of a duplicated binding, update one binding instance', () => {
                const response = generateCaptureSpecDef(
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

                expect(response.bindings).toStrictEqual([
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
                    generateCaptureSpecDef(
                        existingCapture,
                        connectorConfig,
                        resourceConfigs,
                        {
                            [resourceConfig_one.meta.collectionName]: [uuidOne],
                            [resourceConfig_two.meta.collectionName]: [uuidTwo],
                        }
                    ).bindings.map(({ target }) => target)
                ).toStrictEqual([
                    resourceConfig_one.meta.collectionName,
                    resourceConfig_two.meta.collectionName,
                ]);
            });
        });

        describe('when entity type is materialization', () => {
            beforeEach(() => {
                existingMaterialization = {
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
                } as any;
            });

            const generate = () =>
                generateMaterializationSpecDef(
                    existingMaterialization,
                    connectorConfig,
                    resourceConfigs,
                    {
                        [resourceConfig_one.meta.collectionName]: [uuidOne],
                        [resourceConfig_two.meta.collectionName]: [uuidTwo],
                    },
                    { sourceCaptureDefinition }
                ) as any;

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
                    existingMaterialization = {
                        ...existingMaterialization,
                        sourceCapture: {},
                    } as any;

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
                    existingMaterialization = {
                        ...existingMaterialization,
                        source: 'foo',
                        sourceCapture: 'foo',
                    } as any;

                    const response = generate();

                    expect(response.source).toStrictEqual(undefined);
                    expect(response.sourceCapture).toStrictEqual(undefined);
                });
            });
        });
    });

    describe('spec def fields and edge cases', () => {
        // Plain objects, so the drafted spec can be compared before and after
        const plainEndpoint = { image: 'source:dev', config: { sops: {} } };
        const plainDraftedCapture = (): CaptureDef =>
            ({
                ...draftedCapture(),
                endpoint: { connector: plainEndpoint },
            }) as any;

        const bothBindings = () => ({
            [resourceConfig_one.meta.collectionName]: [uuidOne],
            [resourceConfig_two.meta.collectionName]: [uuidTwo],
        });

        test('a new capture gets the starter defaults', () => {
            const response = generateCaptureSpecDef(
                null,
                plainEndpoint,
                {},
                {}
            );

            expect(response.autoDiscover).toEqual({
                addNewBindings: true,
                evolveIncompatibleCollections: true,
            });
        });

        test('a drafted capture gets no starter defaults', () => {
            const response = generateCaptureSpecDef(
                plainDraftedCapture(),
                plainEndpoint,
                {},
                {}
            );

            expect(response.autoDiscover).toBeUndefined();
        });

        test('the drafted spec passed in is not changed', () => {
            const drafted = plainDraftedCapture();
            const before = JSON.stringify(drafted);

            generateCaptureSpecDef(
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

            const { bindings } = generateCaptureSpecDef(
                plainDraftedCapture(),
                plainEndpoint,
                { [uuidOne]: resourceConfig_one, [uuidTwo]: staleTwo },
                bothBindings()
            );

            expect(bindings).toHaveLength(2);
            expect(bindings[0].target).toBe('mock/binding/one');
            expect(bindings[0].resource).toEqual({ fiz: 'resource' });
            expect(bindings[1].target).toBe('mock/binding/two');
            expect(bindings[1].resource).toEqual({ fiz: 'updated two' });
            // Fields the form doesn't manage are kept from the drafted binding
            expect(bindings[1].backfill).toBe(2);
        });

        test('disabling a binding sets `disable`, and enabling removes it', () => {
            const generate = (disable: boolean, drafted: CaptureDef) =>
                generateCaptureSpecDef(
                    drafted,
                    plainEndpoint,
                    {
                        [uuidOne]: {
                            ...resourceConfig_one,
                            meta: { ...resourceConfig_one.meta, disable },
                        },
                    },
                    { [resourceConfig_one.meta.collectionName]: [uuidOne] }
                ).bindings[0];

            const disabled = generate(true, plainDraftedCapture());
            expect(disabled.disable).toBe(true);

            const drafted = plainDraftedCapture();
            drafted.bindings[0].disable = true;
            expect(generate(false, drafted)).not.toHaveProperty('disable');
        });

        test('a Dekaf endpoint is written under `endpoint.dekaf`', () => {
            const dekaf = { variant: 'generic', config: { sops: {} } };

            const { endpoint } = generateMaterializationSpecDef(
                null,
                dekaf as any,
                {},
                {}
            );

            expect(endpoint).toEqual({ dekaf });
        });

        test('omitted materialization options are removed from the drafted spec', () => {
            const drafted = {
                bindings: [],
                endpoint: { connector: plainEndpoint },
                sourceCapture: { capture: 'acmeCo/source' },
                targetNaming: { strategy: 'singleSchema', schema: 'x' },
                onIncompatibleSchemaChange: 'abort',
            } as any;

            const spec = generateMaterializationSpecDef(
                drafted,
                plainEndpoint,
                {},
                {}
            ) as any;

            expect(spec.sourceCapture).toBeUndefined();
            expect(spec.targetNaming).toBeUndefined();
            expect(spec.onIncompatibleSchemaChange).toBeUndefined();
        });
    });
});
