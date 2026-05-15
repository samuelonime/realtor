const router = require('express').Router();
const documentController = require('../controllers/documentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', documentController.list);
router.get('/:id', documentController.get);
router.post('/', documentController.create);
router.put('/:id', authorize('admin', 'manager'), documentController.update);
router.delete('/:id', authorize('admin'), documentController.remove);

module.exports = router;
