import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from '@mui/material';

import { usePopupState } from 'material-ui-popup-state/hooks';

import AlertBox from 'src/components/shared/AlertBox';
import KeyValueList from 'src/components/shared/KeyValueList';

const popupId = 'recordingConsentModal';
function RecordingConsentModal() {
    const { close, open, isOpen } = usePopupState({
        variant: 'dialog',
        popupId: popupId,
        disableAutoFocus: true,
    });

    return (
        <>
            <Button onClick={open}>Update</Button>
            <Dialog id={popupId} open={isOpen} fullWidth maxWidth="md">
                <DialogTitle>Recording Consent Settings</DialogTitle>

                <DialogContent>
                    <Typography>
                        Unlock premium onboarding help with our Enhanced Support
                        package, including expert troubleshooting and real-time
                        screen sharing through secure session replay.
                    </Typography>

                    <AlertBox title="What’s included?" severity="info" short>
                        <KeyValueList
                            data={[
                                {
                                    title: `Priority support with Estuary’s technical team`,
                                },
                                {
                                    title: `Session replay: with your consent, our support
                                team can securely view dashboard activity to
                                resolve issues faster—no sensitive info is
                                shared, and your privacy is protected`,
                                },
                                {
                                    title: `Full control: turn this off at any time in your
                                dashboard settings`,
                                },
                            ]}
                        />
                    </AlertBox>

                    <AlertBox title="How it works:" severity="info" short>
                        <KeyValueList
                            data={[
                                {
                                    title: `Session recording only starts after you accept
                                below`,
                                },
                                {
                                    title: `All recordings are used only for support and
                                deleted after 30 days`,
                                },
                                {
                                    title: `You may opt out or request deletion of any
                                recording at any time`,
                                },
                                {
                                    title: `For details, see our Privacy Policy and Support
                                Terms`,
                                },
                            ]}
                        />
                    </AlertBox>

                    <Typography>
                        You stay in control—support recording is always optional
                        and easily managed in your dashboard.
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button onClick={close}>No</Button>
                    <Button onClick={close}>Yes</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default RecordingConsentModal;
