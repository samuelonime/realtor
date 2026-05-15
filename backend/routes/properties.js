const router = require('express').Router();
const propertyController = require('../controllers/propertyController');
const { authenticate, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  },
});

router.use(authenticate);

router.get('/', propertyController.list);
router.get('/:id', propertyController.get);
router.post('/', propertyController.create);
router.put('/:id', propertyController.update);
router.delete('/:id', authorize('admin', 'manager'), propertyController.remove);
router.post('/:id/images', upload.single('image'), propertyController.uploadImage);

module.exports = router;
