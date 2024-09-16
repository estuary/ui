import Logs from 'components/logs';

function Publish() {
    return (
        <Logs
            token={null}
            height={350}
            loadingLineSeverity="info"
            spinnerMessages={{
                stoppedKey: 'preSavePrompt.logs.spinner.stopped',
                runningKey: 'preSavePrompt.logs.spinner.running',
            }}
        />
    );
}

export default Publish;
