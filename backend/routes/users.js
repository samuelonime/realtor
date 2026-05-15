const router = require('express').Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/agents', userController.getAgents);
router.get('/', authorize('admin', 'manager'), userController.list);
router.get('/:id', authorize('admin', 'manager'), userController.get);
router.post('/', authorize('admin'), userController.create);
router.put('/:id', authorize('admin'), userController.update);
router.delete('/:id', authorize('admin'), userController.remove);

module.exports = router;
