import type { ServerErrorDetailProps } from 'src/components/shared/Alerts/types';

import { useTheme } from '@mui/material';

import Editor from '@monaco-editor/react';

import { unescapeString } from 'src/utils/misc-utils';

const NEW_LINE = '\r\n';

function ServerErrorDetail({ options, val }: ServerErrorDetailProps) {
    const theme = useTheme();

    return (
        <Editor
            defaultLanguage=""
            theme={theme.palette.mode === 'light' ? 'vs' : 'vs-dark'}
            options={{
                // Undocumented see https://github.com/Microsoft/vscode/issues/30795#issuecomment-410998882
                lineDecorationsWidth: 0,
                folding: false,
                lineNumbers: 'off',
                minimap: {
                    enabled: false,
                },
                domReadOnly: true,
                readOnly: true,
                scrollBeyondLastLine: false,
                ...(options ?? {}),
            }}
            value={unescapeString(
                typeof val === 'string'
                    ? val
                    : val.join(NEW_LINE).split(/\\n/).join(NEW_LINE)
            )}
        />
    );
}

export default ServerErrorDetail;
