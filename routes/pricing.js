const express = require('express');
const pricingController = require('../controllers/pricingController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', pricingController.getAll);
router.get('/admin/all', authMiddleware, pricingController.getAllAdmin);
router.post('/', authMiddleware, pricingController.create);
router.put('/:id', authMiddleware, pricingController.update);
router.delete('/:id', authMiddleware, pricingController.remove);

module.exports = router;
