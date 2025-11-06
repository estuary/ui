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
import MaterialEnumControl, {
    materialOneOfEnumControlTester_Descriptions,
} from 'src/forms/renderers/Overrides/material/controls/MaterialEnumControl';
import MaterialTimeControl, {
    materialTimeControlTester,
} from 'src/forms/renderers/Overrides/material/controls/MaterialTimeControl';

const defaultRenderers: JsonFormsRendererRegistryEntry[] = [
    ...materialRenderers,
    // These are normal renderers but customized to our needs
    {
        renderer: MaterialEnumControl,
        tester: materialOneOfEnumControlTester_Descriptions,
    },
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
];

export default defaultRenderers;
