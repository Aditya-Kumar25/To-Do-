import { useState } from "react"
import { api } from "../api/axios"
export function Signup(){
    const [form,setfrom] = useState({
            name:"",
            email:"",
            password:""
})
const [message, setMesage] =useState("")
const [error,setError]= useState("")
function handleChange(e){
    setfrom({
        ...form,
        [e.target.name] : e.target.value
    })
}
async function handleSubmit( e){
    e.preventdefault();
    setMesage("")
    setError("")
    try {
        const res = await api.post ("api/auth/login",form)
        setMesage(res.data.msg || "Signup Successful")
    } catch (err) {
        setMesage(res.data.msg || "Signup Fail")  
    }
    console.log("Data ",form)
}
    return(
        <div>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <label >Name : </label>
                <input 
                name="name"
                value={form.name}
                onChange={handleChange}
                required    
                />
                <label >Email :  </label>
                <input 
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                />
                <label >Password :  </label>
                <input 
                name="password"
                type="password" 
                value={form.password}
                onChange={handleChange}
                required
                />
                <button type="submit">Signup</button>
            </form>
        </div>
    )
}