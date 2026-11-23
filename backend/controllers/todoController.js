const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Todo = require('../models/Todo');
const { startOfDay, endOfDay, startOfWeek, endOfWeek } = require('date-fns');

const getTodos = async (req, res, next) => {
  try {
    const query = { user: req.user.id };

    // Handle Trash vs Active Todos
    if (req.query.filter === 'trash') {
      query.deletedAt = { $ne: null };
    } else {
      query.$or = [{ deletedAt: null }, { deletedAt: { $exists: false } }];
    }

    // Filter by status
    if (req.query.status && ['pending', 'in_progress', 'completed'].includes(req.query.status)) {
      query.status = req.query.status;
    }

    // Filter by priority
    if (req.query.priority && ['low', 'medium', 'high', 'urgent'].includes(req.query.priority)) {
      query.priority = req.query.priority;
    }

    // Filter by category (case-insensitive regex)
    if (req.query.category && req.query.category !== 'All') {
      query.category = { $regex: new RegExp(`^${req.query.category.trim()}$`, 'i') };
    }

    // Search by title or description
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      if (query.$or) {
        // combine search with non-deleted filter
        query.$and = [
          { $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] },
          { $or: [{ title: searchRegex }, { description: searchRegex }] }
        ];
        delete query.$or;
      } else {
        query.$or = [{ title: searchRegex }, { description: searchRegex }];
      }
    }

    // Filter presets (for non-trash)
    if (req.query.filter && req.query.filter !== 'trash') {
      const now = new Date();
      switch (req.query.filter) {
        case 'today':
          query.dueDate = {
            $gte: startOfDay(now),
            $lte: endOfDay(now)
          };
          break;
        case 'upcoming':
          query.dueDate = { $gt: endOfDay(now) };
          query.status = { $in: ['pending', 'in_progress'] };
          break;
        case 'overdue':
          query.dueDate = { $lt: now };
          query.status = { $in: ['pending', 'in_progress'] };
          break;
        case 'completed':
          query.status = 'completed';
          break;
      }
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const total = await Todo.countDocuments(query);
    const todos = await Todo.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        todos,
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getTodoStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const activeCondition = {
      user: userId,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }]
    };

    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const [total, pending, completed, overdue, inProgress, weeklyCompleted, weeklyActive, trashCount] = await Promise.all([
      Todo.countDocuments(activeCondition),
      Todo.countDocuments({ ...activeCondition, status: { $in: ['pending', 'in_progress'] } }),
      Todo.countDocuments({ ...activeCondition, status: 'completed' }),
      Todo.countDocuments({ ...activeCondition, status: { $in: ['pending', 'in_progress'] }, dueDate: { $lt: now } }),
      Todo.countDocuments({ ...activeCondition, status: 'in_progress' }),
      Todo.countDocuments({
        ...activeCondition,
        status: 'completed',
        $or: [
          { completedAt: { $gte: weekStart } },
          { updatedAt: { $gte: weekStart } }
        ]
      }),
      Todo.countDocuments({
        ...activeCondition,
        $or: [
          { dueDate: { $gte: weekStart, $lte: weekEnd } },
          { createdAt: { $gte: weekStart } },
          { status: 'completed', updatedAt: { $gte: weekStart } }
        ]
      }),
      Todo.countDocuments({ user: userId, deletedAt: { $ne: null } })
    ]);

    const weeklyTotal = Math.max(weeklyActive, weeklyCompleted);
    const weeklyRate = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        completed,
        overdue,
        inProgress,
        weeklyCompleted,
        weeklyTotal,
        weeklyRate,
        trashCount
      }
    });
  } catch (error) {
    next(error);
  }
};

const createTodo = async (req, res, next) => {
  try {
    const { title, description, category, priority, status, dueDate, reminderAt, subtasks } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    let parsedSubtasks = [];
    if (subtasks) {
      try {
        const parsed = typeof subtasks === 'string' ? JSON.parse(subtasks) : subtasks;
        if (Array.isArray(parsed)) {
          parsedSubtasks = parsed
            .filter(st => st && (typeof st === 'string' || st.title))
            .map(st => ({
              title: typeof st === 'string' ? st.trim() : (st.title || '').trim(),
              completed: Boolean(st.completed)
            }))
            .filter(st => st.title.length > 0);
        }
      } catch (e) {
        parsedSubtasks = [];
      }
    }

    // Normalize category to TitleCase if matching standard categories
    let normalizedCategory = category ? String(category).trim() : 'Other';
    const standardCategories = ['Work', 'Personal', 'Shopping', 'Health', 'Other'];
    const matchedCategory = standardCategories.find(c => c.toLowerCase() === normalizedCategory.toLowerCase());
    if (matchedCategory) {
      normalizedCategory = matchedCategory;
    }

    const todoData = {
      user: req.user._id || req.user.id,
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
      category: normalizedCategory,
      priority: priority || 'medium',
      status: status || 'pending',
      subtasks: parsedSubtasks
    };

    if (dueDate && dueDate !== '' && dueDate !== 'null' && dueDate !== 'undefined') {
      const parsedDate = new Date(dueDate);
      if (!isNaN(parsedDate.getTime())) {
        todoData.dueDate = parsedDate;
      }
    }

    if (reminderAt && reminderAt !== '' && reminderAt !== 'null' && reminderAt !== 'undefined') {
      const parsedRem = new Date(reminderAt);
      if (!isNaN(parsedRem.getTime())) {
        todoData.reminderAt = parsedRem;
      }
    }

    // Handle file attachments
    if (req.files && req.files.length > 0) {
      todoData.attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      }));
    }

    const todo = await Todo.create(todoData);

    res.status(201).json({
      success: true,
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

const updateTodo = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format'
      });
    }

    const { title, description, category, priority, status, dueDate, reminderAt, subtasks } = req.body;
    const updateData = {};

    if (title !== undefined && title !== null) updateData.title = String(title).trim();
    if (description !== undefined && description !== null) updateData.description = String(description).trim();
    if (category !== undefined && category !== null) {
      let normCat = String(category).trim();
      const standardCategories = ['Work', 'Personal', 'Shopping', 'Health', 'Other'];
      const matched = standardCategories.find(c => c.toLowerCase() === normCat.toLowerCase());
      updateData.category = matched || normCat || 'Other';
    }
    if (priority !== undefined && priority !== null) updateData.priority = priority;

    if (status !== undefined && status !== null) {
      updateData.status = status;
      if (status === 'completed') {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }

    if (dueDate !== undefined) {
      if (dueDate && dueDate !== '' && dueDate !== 'null' && dueDate !== 'undefined') {
        const parsedDate = new Date(dueDate);
        updateData.dueDate = !isNaN(parsedDate.getTime()) ? parsedDate : null;
      } else {
        updateData.dueDate = null;
      }
    }

    if (subtasks !== undefined) {
      try {
        const parsed = typeof subtasks === 'string' ? JSON.parse(subtasks) : subtasks;
        if (Array.isArray(parsed)) {
          updateData.subtasks = parsed
            .filter(st => st && (typeof st === 'string' || st.title))
            .map(st => ({
              title: typeof st === 'string' ? st.trim() : (st.title || '').trim(),
              completed: Boolean(st.completed)
            }))
            .filter(st => st.title.length > 0);
        }
      } catch (e) {
        // preserve or ignore parse error
      }
    }

    // If reminderAt changes, reset reminderSent
    if (reminderAt !== undefined) {
      if (reminderAt && reminderAt !== '' && reminderAt !== 'null' && reminderAt !== 'undefined') {
        const parsedRem = new Date(reminderAt);
        updateData.reminderAt = !isNaN(parsedRem.getTime()) ? parsedRem : null;
      } else {
        updateData.reminderAt = null;
      }
      updateData.reminderSent = false;
    }

    // Handle new file attachments
    let extraOps = {};
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      }));
      extraOps = { $push: { attachments: { $each: newAttachments } } };
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: id, user: req.user._id || req.user.id },
      { $set: updateData, ...extraOps },
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

const deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    // Soft delete: set deletedAt
    todo.deletedAt = new Date();
    await todo.save();

    res.status(200).json({
      success: true,
      message: 'Task moved to trash',
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

const restoreTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user.id,
      deletedAt: { $ne: null }
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Task not found in trash'
      });
    }

    todo.deletedAt = null;
    await todo.save();

    res.status(200).json({
      success: true,
      message: 'Task restored successfully',
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

const permanentDeleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    // Delete associated files from disk
    if (todo.attachments && todo.attachments.length > 0) {
      for (const attachment of todo.attachments) {
        const filePath = path.join(__dirname, '..', 'uploads', attachment.filename);
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.error(`Error deleting file ${attachment.filename}:`, err.message);
        }
      }
    }

    await Todo.deleteOne({ _id: todo._id });

    res.status(200).json({
      success: true,
      message: 'Task permanently deleted',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

const toggleComplete = async (req, res, next) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    if (todo.status === 'pending') {
      todo.status = 'completed';
      todo.completedAt = new Date();
    } else {
      todo.status = 'pending';
      todo.completedAt = null;
    }

    await todo.save();

    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

const downloadAttachment = async (req, res, next) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    const attachment = todo.attachments.find(a => a.filename === req.params.filename);

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    const filePath = path.join(__dirname, '..', 'uploads', attachment.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    res.setHeader('Content-Type', attachment.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

const deleteAttachment = async (req, res, next) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    const attachmentIndex = todo.attachments.findIndex(a => a.filename === req.params.filename);

    if (attachmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    const attachment = todo.attachments[attachmentIndex];

    // Delete file from disk
    const filePath = path.join(__dirname, '..', 'uploads', attachment.filename);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error(`Error deleting file ${attachment.filename}:`, err.message);
    }

    // Remove attachment from array
    todo.attachments.splice(attachmentIndex, 1);
    await todo.save();

    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
