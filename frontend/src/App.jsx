import { useState } from 'react'
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import {Tasks} from './pages/Tasks';
import {Routes,Route} from 'react-router-dom';

function App() {
  

  return (
    <>
    <Routes>
      <Route path='/login' element={<Login/>}/>
      <Route path='/signup' element={<Signup/>}/>
      <Route path='/tasks' element={<Tasks />}/>
    </Routes>
    </>
  )
}

export default App
