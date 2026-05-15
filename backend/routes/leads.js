const router = require('express').Router();
const leadController = require('../controllers/leadController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/followups', leadController.followUps);
router.get('/', leadController.list);
router.get('/:id', leadController.get);
router.post('/', leadController.create);
router.put('/:id', leadController.update);
router.delete('/:id', authorize('admin', 'manager'), leadController.remove);
router.post('/:id/notes', leadController.addNote);
router.post('/bulk-assign', authorize('admin', 'manager'), leadController.bulkAssign);

module.exports = router;
