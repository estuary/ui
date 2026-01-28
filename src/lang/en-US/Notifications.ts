import { CommonMessages } from 'src/lang/en-US/CommonMessages';

export const Notifications: Record<string, string> = {
    'notifications.paymentMethods.missing.title': `Missing Payment Method`,
    'notifications.paymentMethods.missing.cta': `add a payment method`,
    'notifications.paymentMethods.missing.cta.alreadyThere': `add a payment method below`,
    'notifications.paymentMethods.missing.trialCurrent': `The free trial for {tenant} ends in {daysLeft} days, but no payment method has been added to your account.`,
    'notifications.paymentMethods.missing.trialCurrent.instructions': `Please {cta} before your trial ends to continue using ${CommonMessages.productName}.`,
    'notifications.paymentMethods.missing.trialEndsToday': `The free trial for {tenant} ends today, but no payment method has been added to your account.`,
    'notifications.paymentMethods.missing.trialEndsToday.instructions': `Please {cta} today to continue using ${CommonMessages.productName}.`,
    'notifications.paymentMethods.missing.trialPast': `{tenant} is past its free trial without a payment method.`,
    'notifications.paymentMethods.missing.trialPast.instructions': `Please {cta} to continue using ${CommonMessages.productName}.`,
};
