const {Worker} = require('bullmq')
const connection = require('../config/redis')
const Monitor = require('../models/Monitor')
const Log = require('../models/Log')
const checkAPI = require('../services/checkAPI')

const processJob = async (job) => {
    const {monitorId} = job.data

    const monitor = await Monitor.findById(monitorId)
    if(!monitor){
        return {skipped: true, reason: 'monitor_not_found'}
    }
    if(monitor.status !== 'active'){
        return {skipped: true, reason: 'monitor_paused'}
    }

    const result = await checkAPI(
        monitor.url,
        monitor.method,
        monitor.headers,
        monitor.body,
        monitor.queryParams,
        monitor.timeoutMS,
        monitor.expectedResponse,
    )

    await Log.create({
        monitorId: monitor._id,
        userId: monitor.userId,
        request: {
            method: monitor.method,
            url: monitor.url,
            headers: monitor.headers,
            body: monitor.body,
        },
        response: {
            statusCode: result.statusCode,
            headers: result.responseHeaders,
            body: result.responseBody,
            responseTime: result.responseTime,
        },
        success: result.success,
        error: result.error ? {
            message: result.error.message,
            code: result.error.code,
        } : undefined,
    })

    await Monitor.findByIdAndUpdate(monitor._id, {lastRunAt: new Date()})

    return result
}

const monitorWorker = new Worker('monitor-checks', processJob, {
    connection,
    concurrency: 5,
})

monitorWorker.on('completed', (job) => {
    console.log(`Job ${job.id} completed for monitor ${job.data.monitorId}`)
})

monitorWorker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed for monitor ${job?.data?.monitorId}: ${err.message}`)
})

module.exports = monitorWorker
