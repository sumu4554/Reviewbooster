const express = require('express');
const testimonialController = require('../controllers/testimonialController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', testimonialController.getAll);
router.post('/', authMiddleware, testimonialController.create);
router.put('/:id', authMiddleware, testimonialController.update);
router.delete('/:id', authMiddleware, testimonialController.remove);

module.exports = router;
