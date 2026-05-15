const router = require('express').Router();
const dealController = require('../controllers/dealController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', dealController.list);
router.get('/:id', dealController.get);
router.post('/', dealController.create);
router.put('/:id', dealController.update);
router.delete('/:id', dealController.remove);

module.exports = router;
