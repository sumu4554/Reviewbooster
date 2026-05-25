const express = require('express');
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/stats/summary', authMiddleware, reviewController.getStats);
router.get('/', authMiddleware, reviewController.getAll);
router.get('/:id', authMiddleware, reviewController.getById);
router.post('/', authMiddleware, reviewController.create);
router.put('/:id', authMiddleware, reviewController.update);
router.delete('/:id', authMiddleware, reviewController.remove);

module.exports = router;
