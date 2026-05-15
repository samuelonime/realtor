const router = require('express').Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', paymentController.list);
router.get('/:id', paymentController.get);
router.post('/', paymentController.create);
router.delete('/:id', paymentController.remove);

module.exports = router;
