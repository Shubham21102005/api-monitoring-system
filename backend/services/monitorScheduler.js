const monitorQueue = require('../queues/monitorQueue')
const Monitor = require('../models/Monitor')

const scheduleMonitor = async (monitor) => {
    if(!monitor) return
    if(monitor.status !== 'active') return unscheduleMonitor(monitor._id)
    if(!monitor.schedule?.cron && !monitor.schedule?.interval) return unscheduleMonitor(monitor._id)

    await monitorQueue.upsertJobScheduler(
        monitor._id.toString(),
        monitor.schedule.cron
            ? {pattern: monitor.schedule.cron}
            : {every: monitor.schedule.interval * 1000},
        {
            name: 'check',
            data: {monitorId: monitor._id.toString()},
        }
    )
}

const unscheduleMonitor = async (monitorId) => {
    await monitorQueue.removeJobScheduler(monitorId.toString())
}

const reconcileMonitors = async () => {
    const monitors = await Monitor.find({})
    let scheduled = 0
    for(const m of monitors){
        try{
            await scheduleMonitor(m)
            if(m.status === 'active' && (m.schedule?.cron || m.schedule?.interval)) scheduled++
        }catch(err){
            console.error(`Failed to reconcile monitor ${m._id}: ${err.message}`)
        }
    }
    console.log(`Reconciled ${monitors.length} monitors (${scheduled} active scheduled)`)
}

module.exports = {scheduleMonitor, unscheduleMonitor, reconcileMonitors}
