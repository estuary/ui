import { materialCells } from '@jsonforms/material-renderers';
import { customAjv } from 'services/ajv';
import defaultRenderers from './defaultRenderers';
import { defaultOptions } from './shared';

export const jsonFormsDefaults = {
    renderers: defaultRenderers,
    cells: materialCells,
    config: defaultOptions,
    ajv: customAjv,
};
