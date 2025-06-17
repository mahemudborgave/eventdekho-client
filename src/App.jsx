import React, { useState, useEffect, createContext } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import UserContext from './context/UserContext'
import 'react-toastify/dist/ReactToastify.css';
import SearchContext from './context/SearchContext'

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("default@gmail");
  const [token, setToken] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [role, setRole] = useState(null);
  
  // console.log("Jethalal");

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    const storedEmail = localStorage.getItem("email");
    const storedToken = localStorage.getItem("token");

    if (storedUser) setUser(storedUser);
    if (storedEmail) setEmail(storedEmail);
    if (storedToken) setToken(storedToken);
  }, [token]);
  return (
    <>
      <UserContext.Provider value={{ user, setUser, email, setEmail, token, setToken, role, setRole }} >
        <SearchContext.Provider value={{ searchValue, setSearchValue }}>
            <Outlet />
            <ToastContainer />
        </SearchContext.Provider>
      </UserContext.Provider>
    </>
  )
}

export default App
