import { materialCells } from '@jsonforms/material-renderers';

import defaultRenderers from './defaultRenderers';
import { defaultOptions } from './shared';

import { customAjv } from 'src/services/ajv';

export const jsonFormsDefaults = {
    renderers: defaultRenderers,
    cells: materialCells,
    config: defaultOptions,
    ajv: customAjv,
};
