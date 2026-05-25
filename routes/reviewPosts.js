const express = require('express');
const reviewPostController = require('../controllers/reviewPostController');
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/business/:slug', reviewPostController.getBySlug);
router.get('/business/:slug/qr', clientController.getQrCode);
router.post('/submit', reviewPostController.submit);

router.get('/', authMiddleware, reviewPostController.getAll);
router.patch('/:id/approve', authMiddleware, reviewPostController.approve);
router.patch('/:id/reject', authMiddleware, reviewPostController.reject);
router.delete('/:id', authMiddleware, reviewPostController.remove);

module.exports = router;
