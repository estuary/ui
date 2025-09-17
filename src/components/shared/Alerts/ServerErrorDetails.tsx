import type { ServerErrorDetailProps } from 'src/components/shared/Alerts/types';

import { useTheme } from '@mui/material';

import Editor from '@monaco-editor/react';

import { unescapeString } from 'src/utils/misc-utils';

const NEW_LINE = '\r\n';

function ServerErrorDetail({ options, val }: ServerErrorDetailProps) {
    const theme = useTheme();

    return (
        <Editor
            language="plaintext"
            defaultLanguage="plaintext"
            theme={theme.palette.mode === 'light' ? 'vs' : 'vs-dark'}
            options={{
                folding: false,
                domReadOnly: true,
                glyphMargin: false,
                hideCursorInOverviewRuler: true,
                lineNumbers: 'off',
                minimap: { enabled: false },
                overviewRulerLanes: 0,
                readOnly: true,
                renderLineHighlight: 'none',
                renderValidationDecorations: 'off',
                padding: {
                    top: 5,
                },
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
