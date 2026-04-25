const express = require('express')
const {create, getAllMonitors, getMonitor, deleteMonitor, updateMonitor, getMonitorLogs} = require('../controllers/monitorController')
const {authenticateToken} = require('../middleware/authMiddleware')

const router = express.Router();

router.post('/create', authenticateToken, create)
router.get('/getAll', authenticateToken, getAllMonitors)
router.get('/get/:id', authenticateToken, getMonitor)
router.delete('/delete/:id', authenticateToken, deleteMonitor)
router.put('/update/:id', authenticateToken, updateMonitor)
router.get('/logs/:id', authenticateToken, getMonitorLogs)

module.exports = router;