import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true, // todo name/title
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    deadline: {
      type: Date, // so you can store proper dates
      required: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // link task to a user
      required: true,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
