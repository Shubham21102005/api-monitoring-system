const {Resend} = require('resend')

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = process.env.RESEND_FROM || 'Watchtower <onboarding@resend.dev>'

const sendEmail = async (monitor, result) => {
    if (!monitor.alertEmail) return
    if (!resend) {
        console.warn('[sendEmail] RESEND_API_KEY not set, skipping')
        return
    }

    const subject = `[ALERT] Monitor "${monitor.name}" is failing`
    const text = [
        `Monitor "${monitor.name}" failed a check.`,
        '',
        `URL:            ${monitor.url}`,
        `METHOD:         ${monitor.method}`,
        `TIME:           ${new Date().toISOString()}`,
        `FAILURE_REASON: ${result.failureReason || 'unknown'}`,
        `STATUS:         ${result.statusCode ?? 'N/A'}`,
        `RESPONSE_TIME:  ${result.responseTime}ms`,
        result.error?.message ? `ERROR:          ${result.error.message}` : null,
        result.error?.code ? `CODE:           ${result.error.code}` : null,
        '',
        '— Watchtower',
    ].filter(Boolean).join('\n')

    try {
        await resend.emails.send({
            from: FROM,
            to: monitor.alertEmail,
            subject,
            text,
        })
        console.log(`[sendEmail] alert sent for monitor ${monitor._id} to ${monitor.alertEmail}`)
    } catch (err) {
        console.error(`[sendEmail] failed for monitor ${monitor._id}: ${err.message}`)
    }
}

module.exports = sendEmail
