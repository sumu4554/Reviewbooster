const express = require('express');
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, clientController.getAll);
router.get('/:id', authMiddleware, clientController.getById);
router.post('/', authMiddleware, clientController.create);
router.put('/:id', authMiddleware, clientController.update);
router.delete('/:id', authMiddleware, clientController.remove);

module.exports = router;
