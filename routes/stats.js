const express = require('express');
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', statsController.getAll);
router.put('/', authMiddleware, statsController.update);
router.get('/dashboard', authMiddleware, statsController.getDashboard);

module.exports = router;
