import { useState } from "react"
import {api} from "../api/axios"
export function Login(){
    const [form,setfrom] = useState({
            email:"",
            password:""
})

const [error,setError] = useState("")
function handleChange(e){
    setfrom({
        ...form,
        [e.target.name] : e.target.value
    })
}
async function handleSubmit( e){
    e.preventDefault();
    setError("");
    try {
        const res = await api.post("/api/auth/login",form)
        const {token,user} = res.data;
        
        localStorage.setItem("token",token)
        localStorage.setItem("user",JSON.stringify(user))
        console.log("Logged in",user)
        alert("Login Succesful")
    } catch (error) {
        setError(error.response?.data?.message || "Login fail ho gya")
    }
    console.log("Data ",form)
}
    return(
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
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
                <button type="submit">Login</button>
            </form>
        </div>
    )
}