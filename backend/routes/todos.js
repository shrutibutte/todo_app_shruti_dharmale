const router = require('express').Router();
const {
  getTodos,
  getTodoStats,
  createTodo,
  updateTodo,
  deleteTodo,
  restoreTodo,
  permanentDeleteTodo,
  toggleComplete,
  downloadAttachment,
  deleteAttachment
} = require('../controllers/todoController');
const auth = require('../middleware/auth');
const { uploadMiddleware } = require('../middleware/upload');

router.use(auth); // All todo routes require auth

router.get('/stats', getTodoStats);
router.get('/', getTodos);
router.post('/', uploadMiddleware, createTodo);
router.put('/:id', uploadMiddleware, updateTodo);
router.delete('/:id', deleteTodo);
router.patch('/:id/restore', restoreTodo);
router.delete('/:id/permanent', permanentDeleteTodo);
router.patch('/:id/complete', toggleComplete);
router.get('/:id/attachments/:filename', downloadAttachment);
router.delete('/:id/attachments/:filename', deleteAttachment);

module.exports = router;
