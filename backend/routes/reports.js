const router = require('express').Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/monthly-revenue', reportController.monthlyRevenue);
router.get('/lead-funnel', reportController.leadFunnel);
router.get('/agent-leaderboard', authorize('admin', 'manager'), reportController.agentLeaderboard);
router.get('/property-performance', authorize('admin', 'manager'), reportController.propertyPerformance);

module.exports = router;
