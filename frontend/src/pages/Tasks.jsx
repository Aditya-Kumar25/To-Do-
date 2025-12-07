import{ useState, useEffect } from "react";
import { api } from "../api/axios";
export function Tasks(){
    const[tasks,setTasks] = useState([])
    const[addtodo,setAddTodo]=useState({
      title:"",description:"",completed:""
    })
    const[updatetodo,setUpdateTodo] = useState({
      id:"",title:"",description:"",completed:false
    })

    useEffect(()=>{
      api.get("/api/tasks/FetchTasks")
        .then(response =>{
          console.log(response.data)
          setTasks(response.data)})
    },[])
       console.log(tasks) 

    function handleAdd(e){
        setAddTodo(prev => ({
          ...prev,[e.target.name] : e.target.value}
        ))
    }
    async function Add(){
      const res = await api.post("/api/tasks/AddTask",{
        title:addtodo.title,
        description:addtodo.description,
        completed:false
      })
        setTasks(prev=>[...prev,res.data])

      setAddTodo({
      title:"",description:"",completed:""
    });
    }

    function startedit(task){
        setUpdateTodo({
              id:task._id,
              title:task.title || "",
              description:task.description || "",
              completed:task.completed ?? false
        })
    }
    async function Edit(){
      const res = await api.put(`/api/tasks/${updatetodo.id}`,{
        title:updatetodo.title,
        description:updatetodo.description,
        completed:updatetodo.completed
      })
        setTasks(prev=>prev.map(t => t._id === updatetodo.id ? {...t,...res.data}:t)  )

        setUpdateTodo({
          id:"",title:"",description:"",completed:""
        })
    }
  
  function handleUpdateChange(e){
    setUpdateTodo(prev => ({
      ...prev,[e.target.name]: e.target.value
    }))
  }

    return(
      <div>
         <h2>Your tasks</h2>
         <input name="title" placeholder="title" value={addtodo.title} onChange={handleAdd}/>
         <input name="description" placeholder="description" value={addtodo.description} onChange={handleAdd}/>
         <button onClick={Add}>Add</button>
        
         <ul>
            {tasks.map(task => (
              <li key={task._id}> 
              <h3>{task.title}</h3> 
              <h4>{task.description}</h4>
              <button onClick={()=> startedit(task)}>Edit</button>
              <input name="title" placeholder="add updated title" value={updatetodo.title} onChange={handleUpdateChange} />
            <input name="title" placeholder="add updated description" value={updatetodo.description} onChange={handleUpdateChange} />
            <button onClick={Edit}>Save</button>
              </li>
              
            ))}
         </ul>
         {updatetodo.id && (
          <div>
            <h3>Edit Task</h3>
            <input name="title" placeholder="add updated title" value={updatetodo.title} onChange={handleUpdateChange} />
            <input name="description" placeholder="add updated description" value={updatetodo.description} onChange={handleUpdateChange} />
            <button onClick={Edit}>Save</button>
          </div>
         )}
         
      </div>
    )
 
  }