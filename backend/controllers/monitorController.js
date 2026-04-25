const monitor = require('../models/Monitor')
const Log = require('../models/Log')
const monitorQueue = require('../queues/monitorQueue')
const {scheduleMonitor} = require('../services/monitorScheduler')


const create = async (req,res)=>{
    try {

        const {name, url, method, headers, body, queryParams, schedule, timeoutMS, retries, expectedResponse} = req.body
        const userId = req.user._id

        
        if(!name || !url || !method){
            return res.status(400).json({message: "All fields are required"})
        }

        const newMonitor = await monitor.create({name, url, method, headers, body, queryParams, schedule, timeoutMS, retries, expectedResponse, userId})

        if(newMonitor.status === 'active' && (newMonitor.schedule?.cron || newMonitor.schedule?.interval)){
            await monitorQueue.upsertJobScheduler(
                newMonitor._id.toString(),
                newMonitor.schedule.cron
                    ? {pattern: newMonitor.schedule.cron}
                    : {every: newMonitor.schedule.interval * 1000},
                {
                    name: 'check',
                    data: {monitorId: newMonitor._id.toString()},
                }
            )
        }

        return res.status(201).json({message: "Monitor created successfully", monitor: newMonitor})

    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Internal Server Error"})
    }
}
const getAllMonitors = async (req,res)=>{
    try{
        const userId = req.user._id;

        

        const monitors = await monitor.find({userId});

        return res.status(200).json({monitors});

    }catch(error){
        console.log(error)
        res.status(500).json({message: "Internal Server Error"})
    }

}

const getMonitor = async (req,res)=>{
    try{
        const userId = req.user._id;
        const monitorId = req.params.id;

        
       

        if(!monitorId){
            return res.status(400).json({message: "Monitor ID is missing. "})
        }

        const foundMonitor = await monitor.findOne({_id: monitorId, userId});

        if(!foundMonitor){
            return res.status(404).json({message: "Monitor doesnt exist. "});
        }

        return res.status(200).json({foundMonitor});



    }catch(error){
        console.log(error)
        res.status(500).json({message: "Internal Server Error"})
    }

}

const deleteMonitor = async (req,res)=>{
    try{
        const userId = req.user._id;
        const monitorId = req.params.id;

        
        if(!monitorId){
            return res.status(400).json({message: "Monitor ID is missing. "})
        }
        
        const foundMonitor = await monitor.findOneAndDelete({_id: monitorId, userId});

        if(!foundMonitor){
            return res.status(404).json({message: "Monitor doesnt exist. "})
        }


        await monitorQueue.removeJobScheduler(monitorId)

        return res.status(200).json({message: "Monitor deleted successfully"})
        
        
    
    }catch(error){
        console.log(error)
        res.status(500).json({message: "Internal Server Error"})
    }
}

const updateMonitor = async (req,res)=>{
    try{
        const userId = req.user._id;
        const monitorId = req.params.id;

        const {name, url, method, headers, body, queryParams, schedule, timeoutMS, retries, expectedResponse, status} = req.body;
        if(!name || !url || !method){
            return res.status(400).json({message: "All fields are required"})
        }

       
        if(!monitorId){
            return res.status(400).json({message: "Monitor ID is missing. "})
        }

        const foundMonitor = await monitor.findOne({_id: monitorId, userId});

        if(!foundMonitor){
            return res.status(404).json({message: "Monitor doesnt exist. "})
        }
        


        const updatedMonitor = await monitor.findOneAndUpdate({_id: monitorId}, {name, url, method, headers, body, queryParams, schedule, timeoutMS, retries, expectedResponse, status},  {new: true});

        await scheduleMonitor(updatedMonitor)

        return res.status(200).json({updatedMonitor});
        
    }catch(error){
        console.log(error)
        res.status(500).json({message: "Internal Server Error"})
    }
}






const getMonitorLogs = async (req,res)=>{
    try{
        const userId = req.user._id;
        const monitorId = req.params.id;
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const skip = parseInt(req.query.skip) || 0; //for pagination

        if(!monitorId){
            return res.status(400).json({message: "Monitor ID is missing."})
        }

        const ownedMonitor = await monitor.findOne({_id: monitorId, userId});
        if(!ownedMonitor){
            return res.status(404).json({message: "Monitor doesnt exist."})
        }

        const logs = await Log.find({monitorId})
            .sort({runAt: -1})
            .skip(skip)
            .limit(limit);

        return res.status(200).json({logs});

    }catch(error){
        console.log(error)
        res.status(500).json({message: "Internal Server Error"})
    }
}


module.exports = {
    create,
    getAllMonitors,
    getMonitor,
    deleteMonitor,
    updateMonitor,
    getMonitorLogs
}

