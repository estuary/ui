import type { JsonFormsRendererRegistryEntry } from '@jsonforms/core';

import { materialRenderers } from '@jsonforms/material-renderers';

import {
    CatalogName,
    catalogNameTypeTester,
} from 'src/forms/renderers/CatalogName';
import {
    CollapsibleGroup,
    collapsibleGroupTester,
} from 'src/forms/renderers/CollapsibleGroup';
import {
    ConnectorType,
    connectorTypeTester,
} from 'src/forms/renderers/Connectors';
import { DataPlane, dataPlaneTester } from 'src/forms/renderers/DataPlanes';
import {
    DurationTypeControl,
    durationTypeTester,
} from 'src/forms/renderers/Duration';
import MaterialEnumControlWith_Description, {
    materialOneOfEnumControlTester_Descriptions,
} from 'src/forms/renderers/MaterialEnumControl';
import {
    MissingType,
    missingTypeTester,
} from 'src/forms/renderers/MissingType';
import {
    MultiLineSecret,
    multiLineSecretTester,
} from 'src/forms/renderers/MultiLineSecret';
import {
    NullableArrayControl,
    nullableArrayTester,
} from 'src/forms/renderers/nullable/Array';
import {
    NullableControl,
    nullableControlTester,
} from 'src/forms/renderers/nullable/Control';
import { oAuthProviderTester, OAuthType } from 'src/forms/renderers/OAuth';
import MaterialOneOfRenderer_Discriminator, {
    materialOneOfControlTester_Discriminator,
} from 'src/forms/renderers/Overrides/material/complex/MaterialOneOfRenderer_Discriminator';
import MaterialDateControl, {
    materialDateControlTester,
} from 'src/forms/renderers/Overrides/material/controls/MaterialDateControl';
import MaterialDateTimeControl, {
    materialDateTimeControlTester,
} from 'src/forms/renderers/Overrides/material/controls/MaterialDateTimeControl';
import MaterialTimeControl, {
    materialTimeControlTester,
} from 'src/forms/renderers/Overrides/material/controls/MaterialTimeControl';

const defaultRenderers: JsonFormsRendererRegistryEntry[] = [
    ...materialRenderers,
    // These are normal renderers but customized to our needs
    {
        renderer: MaterialOneOfRenderer_Discriminator,
        tester: materialOneOfControlTester_Discriminator,
    },
    {
        renderer: MaterialDateTimeControl,
        tester: materialDateTimeControlTester,
    },
    {
        renderer: MaterialDateControl,
        tester: materialDateControlTester,
    },
    {
        renderer: MaterialTimeControl,
        tester: materialTimeControlTester,
    },

    // Custom layouts
    { renderer: OAuthType, tester: oAuthProviderTester },
    { renderer: CollapsibleGroup, tester: collapsibleGroupTester },

    // Custom controls
    { renderer: MissingType, tester: missingTypeTester },
    { renderer: ConnectorType, tester: connectorTypeTester },
    { renderer: CatalogName, tester: catalogNameTypeTester },
    { renderer: DataPlane, tester: dataPlaneTester },
    { renderer: MultiLineSecret, tester: multiLineSecretTester },
    { renderer: NullableArrayControl, tester: nullableArrayTester },
    { renderer: NullableControl, tester: nullableControlTester },
    { renderer: DurationTypeControl, tester: durationTypeTester },

    // This _could_ become a generic override but it is currently very
    //  narrow in scope (Q4 2025)
    {
        renderer: MaterialEnumControlWith_Description,
        tester: materialOneOfEnumControlTester_Descriptions,
    },
];

export default defaultRenderers;
