const {Queue} = require('bullmq')
const connection = require('../config/redis')

const monitorQueue = new Queue('monitor-checks', {
    connection,
    defaultJobOptions: {
        removeOnComplete: 1000,
        removeOnFail: 5000,
    },
})

module.exports = monitorQueue
