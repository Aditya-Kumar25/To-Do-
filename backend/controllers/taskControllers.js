import Task from "../models/Task.js";

// @desc Add new task
// @route POST /api/tasks
export const addTask = async (req, res) => {
  try {
    const { title, description, completed, deadline } = req.body;

    // Check duplicate title for same user
    const existingTask = await Task.findOne({ title, user: req.user.id });
    if (existingTask) {
      return res.status(400).json({ msg: "Task with this title already exists" });
    }

    const task = new Task({
      title,
      description,
      completed: completed || false,
      deadline,
      user: req.user.id,
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// @desc Get all tasks for logged in user
// @route GET /api/tasks
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// @desc Update task
// @route PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  try {
    const { title, description, completed, deadline } = req.body;

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    // Check if task belongs to logged in user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    // Update fields
    task.title = title || task.title;
    task.description = description || task.description;
    task.completed = completed !== undefined ? completed : task.completed;
    task.deadline = deadline || task.deadline;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// @desc Delete task
// @route DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    // Check if task belongs to logged in user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    await task.deleteOne();
    res.json({ msg: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};
