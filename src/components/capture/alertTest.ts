import { PostgrestError } from '@supabase/postgrest-js';
import { supabaseClient } from 'services/supabase';

interface NotificationQuery {
    notification_id: string;
    notification_interval: string;
    checkpoint_start: string;
    checkpoint_end: string;
    active_condition: boolean;
    subscribed: boolean;
    alert_title: string;
    alert_message: string;
    verified_emails: string[];
    live_spec_id: string;
    catalog_name: string;
    spec_type: string;
    user_email: string;
}

interface CatalogStatsQuery {
    catalog_name: string;
    grain: string;
    ts: string;
    bytes_written_by_me: number;
    bytes_written_to_me: number;
    bytes_read_by_me: number;
    bytes_read_from_me: number;
}

interface EmailConfig {
    notification_id: string;
    emails: string[];
    subject: string;
    html: string;
}

const corsHeaders = {};

const RESEND_API_KEY = 're_QyHcrzEv_MJA46bvn7bwCt7rPN4vNXjxT';

const returnPostgresError = (error: PostgrestError) => {
    console.log(error);
};

const getDataProcessedInInterval = (
    startStat: CatalogStatsQuery,
    endStat: CatalogStatsQuery,
    specType: string
): boolean => {
    if (specType === 'capture') {
        const dataProcessed =
            endStat.bytes_written_by_me - startStat.bytes_written_by_me;

        return dataProcessed > 0;
    } else if (specType === 'materialization') {
        const dataProcessed =
            endStat.bytes_read_by_me - startStat.bytes_read_by_me;

        return dataProcessed > 0;
    } else {
        const dataWritten =
            endStat.bytes_written_to_me - startStat.bytes_written_to_me;
        const dataRead =
            endStat.bytes_read_from_me - startStat.bytes_read_from_me;

        return dataWritten > 0 || dataRead > 0;
    }
};

export const serve = async (_request: Request): Promise<Response> => {
    const { data: notifications, error: notificationError } =
        await supabaseClient
            .from<NotificationQuery>('alerts_ext')
            .select('*')
            .eq('subscribed', true);

    if (notificationError !== null) {
        returnPostgresError(notificationError);
    }

    if (!notifications || notifications.length === 0) {
        // Terminate the function without error if there aren't any active notification subscriptions in the system.
        return new Response(null, {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }

    console.log('NOTIFICATIONS', notifications);

    // Determine a date to use to narrow the catalog stats query results. The largest notification interval
    // supported at this time is 24 hours.
    const startDate = new Date();
    const yesterday = startDate.getUTCDate() - 1;

    startDate.setUTCMilliseconds(0);
    startDate.setUTCSeconds(0);
    startDate.setUTCMinutes(0);
    startDate.setUTCHours(0);
    startDate.setUTCDate(yesterday);

    const catalogNames = notifications.map(({ catalog_name }) => catalog_name);

    const { data: catalogStats, error: catalogStatsError } =
        await supabaseClient
            .from<CatalogStatsQuery>('catalog_stats')
            .select(
                `catalog_name,
                 grain,
                 ts,
                 bytes_written_by_me,
                 bytes_written_to_me,
                 bytes_read_by_me,
                 bytes_read_from_me`
            )
            .in('catalog_name', catalogNames)
            .eq('grain', 'hourly')
            .gte('ts', startDate.toUTCString());

    if (catalogStatsError !== null) {
        returnPostgresError(catalogStatsError);
    }

    if (!catalogStats || catalogStats.length === 0) {
        return new Response(
            JSON.stringify({
                error: {
                    code: 'catalog_stats_missing',
                    message: `Catalog stats not found.`,
                    description: `Failed to fetch the catalog stats of the requested entities.`,
                },
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            }
        );
    }

    console.log('START DATE', startDate);
    console.log('CATALOG NAMES', catalogNames);
    console.log('CATALOG STATS', catalogStats);

    const alertEmailConfig: EmailConfig[] = notifications
        .filter(
            ({
                active_condition,
                catalog_name,
                checkpoint_end,
                checkpoint_start,
                spec_type,
            }) => {
                const startStat = catalogStats.find(
                    (stat) =>
                        stat.catalog_name === catalog_name &&
                        stat.ts === checkpoint_start
                );

                const endStat = catalogStats.find(
                    (stat) =>
                        stat.catalog_name === catalog_name &&
                        stat.ts === checkpoint_end
                );

                if (startStat && endStat) {
                    return (
                        !active_condition &&
                        getDataProcessedInInterval(
                            startStat,
                            endStat,
                            spec_type
                        )
                    );
                }

                return false;
            }
        )
        .map(
            ({
                alert_title,
                alert_message,
                catalog_name,
                notification_id,
                notification_interval,
                spec_type,
                user_email,
            }) => {
                const subject = alert_title
                    .replaceAll('{spec_type}', spec_type)
                    .replaceAll('{catalog_name}', catalog_name);

                const html = alert_message
                    .replaceAll('{spec_type}', spec_type)
                    .replaceAll('{catalog_name}', catalog_name)
                    .replaceAll(
                        '{notification_interval}',
                        notification_interval
                    );

                return { notification_id, emails: [user_email], subject, html };
            }
        );

    console.log('ALERTS EMAIL CONFIG', alertEmailConfig);

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
            from: 'Acme <onboarding@resend.dev>',
            to: ['delivered@resend.dev'],
            subject: 'hello world',
            html: '<strong>it works!</strong>',
        }),
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};
