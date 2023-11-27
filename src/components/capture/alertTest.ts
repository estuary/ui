import { isEmpty, isFinite } from 'lodash';

interface DataProcessingArguments {
    bytes_processed: number;
    emails: string[];
    evaluation_interval: string;
    spec_type: string;
}

interface AlertRecord {
    alert_type: string;
    catalog_name: string;
    fired_at: string;
    resolved_at: string | null;
    arguments: DataProcessingArguments;
}

interface EmailConfig {
    emails: string[];
    subject: string;
    content: string;
}

export const handleSuccess = <T>(response: any) => {
    return response.error
        ? {
              data: null,
              error: response.error,
          }
        : {
              data: response.data as T,
          };
};

export const handleFailure = (error: any) => {
    return {
        data: null,
        error,
    };
};

// const dataProcessingAlertType = 'data_not_processed_in_interval';

// const TABLES = { ALERT_HISTORY: 'alert_history' };

const getTaskDetailsPageURL = (catalogName: string, specType: string) =>
    `https://dashboard.estuary.dev/${specType}s/details/overview?catalogName=${catalogName}`;

const formatAlertEmail = ({
    arguments: { emails, evaluation_interval, spec_type },
    catalog_name,
}: AlertRecord): EmailConfig => {
    let formattedEvaluationInterval = evaluation_interval;

    // A postgresql interval in hour increments has the following format: 'HH:00:00'.
    if (evaluation_interval.includes(':')) {
        const timeOffset = evaluation_interval.split(':');
        const hours = Number(timeOffset[0]);

        // Ideally, an hour-based interval less than ten would be represented by a single digit. To accomplish this,
        // the hour segment of the evaluation interval is selected (i.e., timeOffset[0]) and attempted to be converted to a number.
        // This conditional is a failsafe, in the event the aforementioned conversion fails which would result in the display
        // of two digits for the hour (e.g., 02 hours instead of 2 hours).
        formattedEvaluationInterval = isFinite(hours)
            ? `${hours} hours`
            : `${timeOffset[0]} hours`;
    }

    const subject = `Estuary Flow: Alert for ${spec_type} ${catalog_name}`;

    const detailsPageURL = getTaskDetailsPageURL(catalog_name, spec_type);

    const content = `<p>You are receiving this alert because your task, ${spec_type} ${catalog_name} hasn't seen new data in ${formattedEvaluationInterval}.  You can locate your task <a href="${detailsPageURL}" target="_blank" rel="noopener">here</a> to make changes or update its alerting settings.</p>`;

    return {
        content,
        emails,
        subject,
    };
};

const formatConfirmationEmail = ({
    arguments: { emails, spec_type },
    catalog_name,
}: AlertRecord): EmailConfig => {
    const subject = `Estuary Flow: Alert for ${spec_type} ${catalog_name}`;

    const detailsPageURL = getTaskDetailsPageURL(catalog_name, spec_type);

    const content = `<p>You are receiving this notice because a previous alert for your task, ${spec_type} ${catalog_name}, has now resolved.  You can locate your task <a href="${detailsPageURL}" target="_blank" rel="noopener">here</a> to make changes or update its alerting settings.</p>`;

    return {
        content,
        emails,
        subject,
    };
};

const emailNotifications = async (
    pendingNotification: EmailConfig,
    token: string,
    senderAddress: string
): Promise<Response[]> => {
    const { content, emails, subject } = pendingNotification;

    const notificationPromises = emails.map((email) => {
        return fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                from: senderAddress,
                to: email,
                subject,
                html: `
                  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                    ${content}

                    <p style="margin-bottom: 0;">Thanks,</p>
                    <p style="margin-top: 0;">Estuary Team</p>
                  </div>
                `,
            }),
        });
    });

    return Promise.all(notificationPromises);
};

const corsHeaders = {};

// const returnPostgresError = (error: PostgrestError) => {
//     console.log(error);
// };

export const serve = async (request: Request): Promise<Response> => {
    const alertRecord: AlertRecord = await request.json();

    if (isEmpty(alertRecord)) {
        // Terminate the function without error if there aren't any active notifications in the system.
        return new Response(null, {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }

    const pendingEmail: EmailConfig =
        alertRecord.resolved_at === null
            ? formatAlertEmail(alertRecord)
            : formatConfirmationEmail(alertRecord);

    const resendToken = `Deno.env.get('RESEND_API_KEY')`;
    const senderAddress = `Deno.env.get('RESEND_EMAIL_ADDRESS')`;

    if (!resendToken || !senderAddress) {
        return new Response(
            JSON.stringify({
                error: {
                    code: 'invalid_resend_credentials',
                    message: `Unauthorized: access is denied due to invalid credentials.`,
                    description: `The server could not verify that you are authorized to access the desired resource with the credentials provided.`,
                },
            }),
            {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                },
                status: 401,
            }
        );
    }

    const responses = await emailNotifications(
        pendingEmail,
        resendToken,
        senderAddress
    );

    const errors = responses.filter((response) => response.status >= 400);

    if (errors.length > 0) {
        console.info(`${responses.length - errors.length} emails sent.`);

        errors.forEach(async (error) => {
            console.error(await error.text());
        });

        return new Response(
            JSON.stringify({
                error: {
                    code: 'email_send_failure',
                    message: `Sending email failed.`,
                    description: `Failed to send ${errors.length} emails.`,
                },
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            }
        );
    } else {
        console.info(`${responses.length} emails sent.`);
    }

    return new Response(null, {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};
