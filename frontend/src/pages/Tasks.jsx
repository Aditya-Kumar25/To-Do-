import { useEffect, useState } from "react";
import { api } from "../api/axios";

export function Tasks(){
    const [tasks,setTasks] = useState([])
    const [loading,setLoading] = useState(true)
    const [error,setError] = useState("")
    const [newTask,setNewTask] = useState({
        title:"",
        description :"",
        deadline:""
    })
const [edit,setEdit] = useState({
  id:"",
  title:"",
  description:"",
  deadline: "",                                                         
})
function handleEditTaskChange(e){
  setEdit({
    ...edit,
    [e.target.name] : e.target.value
  })  
}
function startEdit(task) {
    setEdit({
      id: task._id,
      title: task.title,
      description: task.description,
      deadline: task.deadline
        ? new Date(task.deadline).toISOString().slice(0, 10)
        : ""
    });
  }
async function handleEditTask(e) {
  e.preventDefault();
  setError("")
  const {id,title,description,deadline} = edit;
  const payload ={
    title,description,...(deadline ? {deadline : new Date(deadline)}:{})
  }

  const res =await api.put(`/api/tasks/${id}`,payload)
  const updateTask = res.data;

  setTasks(prev => prev.map(t => (t._id === id ? {...t,...updateTask}:t)))

  setEdit({id:"", title: "", description:"" , deadline:""})
}


function handleNewTaskChange(e){
    setNewTask({
        ...newTask,
            [e.target.name] : e.target.value
    });
}

    async function handleAddTask(e) {
  e.preventDefault();
  setError("");

  if (!newTask.title.trim()) {
    setError("Title required");
    return;
  }

  try {
    await api.post("/api/tasks/AddTask", newTask);
    setNewTask({ title: "", description: "", deadline: "" });
    fetchTasks(); // refresh tasks
  } catch (err) {
    setError(err.response?.data?.msg || "Failed to add task");
  }
}

async function fetchTasks() {
    try {
        const res = await api.get("/api/tasks/FetchTasks")
        setTasks(res.data)
    } catch (error) {
        setError(error.response?.data?.msg || "Failed to  fetch tasks")
    }
    finally{
        setLoading(false);
    }
}
    useEffect(() => {
        fetchTasks();
    },[])
return (
    <div>
      {/* ---------------- ADD TASK FORM ---------------- */}
      <form onSubmit={handleAddTask} style={{ marginBottom: "20px" }}>
        <h3>Add New Task</h3>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <input
          type="text"
          name="title"
          placeholder="Title"
          value={newTask.title}
          onChange={handleNewTaskChange}
          required
        />
        <br /><br />

        <input
          type="text"
          name="description"
          placeholder="Description"
          value={newTask.description}
          onChange={handleNewTaskChange}
        />
        <br /><br />

        <input
          type="date"
          name="deadline"
          value={newTask.deadline}
          onChange={handleNewTaskChange}
        />
        <br /><br />

        <button type="submit">Add Task</button>
      </form>

      <h2>Your Tasks</h2>

      {loading && <p>Loading...</p>}
      {!loading && tasks.length === 0 && <p>No tasks found.</p>}

      <ul>
        {tasks.map((task) => (
          <li key={task._id} style={{ marginBottom: "20px" }}>
            {edit.id === task._id ? (
              /* ------------------- EDIT MODE ------------------- */
              <form onSubmit={handleEditTask}>
                <input
                  name="title"
                  value={edit.title}
                  onChange={handleEditTaskChange}
                />
                <br /><br />

                <input
                  name="description"
                  value={edit.description}
                  onChange={handleEditTaskChange}
                />
                <br /><br />

                <input
                  type="date"
                  name="deadline"
                  value={edit.deadline}
                  onChange={handleEditTaskChange}
                />
                <br /><br />

                <button type="submit">Save</button>
                <button
                  type="button"
                  onClick={() =>
                    setEdit({ id: "", title: "", description: "", deadline: "" })
                  }
                >
                  Cancel
                </button>
              </form>
            ) : (
              /* ------------------- VIEW MODE ------------------- */
              <>
                <strong>{task.title}</strong> — {task.description}
                <br />
                Deadline:{" "}
                {task.deadline
                  ? new Date(task.deadline).toLocaleDateString()
                  : "None"}
                <br />
                Status: {task.completed ? "✔" : "❌"}
                <br /><br />

                {/* ------------------- EDIT BUTTON (NEW) ------------------- */}
                <button onClick={() => startEdit(task)}>Edit</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}