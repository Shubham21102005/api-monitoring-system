const monitor = require('../models/Monitor')


const create = async (req,res)=>{
    try {

        const {name, url, method, headers, body, queryParams, schedule, timeoutMS, retries, expectedResponse} = req.body
        const userId = req.user._id

        
        if(!name || !url || !method){
            return res.status(400).json({message: "All fields are required"})
        }

        const newMonitor = await monitor.create({name, url, method, headers, body, queryParams, schedule, timeoutMS, retries, expectedResponse, userId})

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

        const {name, url, method, headers, body, queryParams, schedule, timeoutMS, retries, expectedResponse} = req.body;
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
        


        const updatedMonitor = await monitor.findOneAndUpdate({_id: monitorId}, {name, url, method, headers, body, queryParams, schedule, timeoutMS, retries, expectedResponse},  {new: true});
        
        return res.status(200).json({updatedMonitor});
        
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
    updateMonitor
}

