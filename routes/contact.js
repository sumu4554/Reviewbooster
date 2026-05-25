const express = require('express');
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', contactController.submit);
router.get('/', authMiddleware, contactController.getAll);
router.patch('/:id/read', authMiddleware, contactController.markRead);
router.delete('/:id', authMiddleware, contactController.remove);

module.exports = router;
