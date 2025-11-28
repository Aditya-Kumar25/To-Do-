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




    useEffect(() => {
        async function fetchTasks() {
            try {
                const res = await api.get("/api/tasks/Fetchtasks")
                setTasks(res.data)
            } catch (error) {
                setError(error.response?.data?.msg || "Failed to  fetch tasks")
            }
            finally{
                setLoading(false);
            }
        }
    },[])
    return(
        <div>
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

            {error && <p style={{ color: "red" }}>{error}</p>}

      {loading ? <p>Loading...</p> : null}

      {!loading && tasks.length === 0 && (
        <p>No tasks found. Add one!</p>
      )}

      <ul>
        {tasks.map((task) => (
            <li key={task._id}>
                <strong>{tasks.title}</strong> - {task.description}
                {task.completed ? "ok":"not ok"}
            </li>
        ))}
      </ul>
        </div>
    );
}