import React, { useState, useEffect, createContext } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import { Outlet } from 'react-router-dom'
import { Bounce, Flip, Slide, ToastContainer } from 'react-toastify'
import UserContext from './context/UserContext'
import 'react-toastify/dist/ReactToastify.css';
import SearchContext from './context/SearchContext'
import ScrollToTop from './components/ScrollToTop'
import { ThemeProvider } from './components/ui/ThemeProvider';

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [role, setRole] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // console.log("Jethalal");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedEmail = localStorage.getItem("email");
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (storedUser) setUser(storedUser);
    if (storedEmail) setEmail(storedEmail);
    if (storedToken) setToken(storedToken);
    if (storedRole) setRole(storedRole);

    setIsLoaded(true);
  }, [token]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <UserContext.Provider value={{ user, setUser, email, setEmail, token, setToken, role, setRole }} >
      <SearchContext.Provider value={{ searchValue, setSearchValue }}>
          <ScrollToTop />
          <Outlet />
          <ToastContainer
          theme="colored"
          transition={Flip}
          autoClose={1000}
          style={{ marginTop: '80px' }}
          />
      </SearchContext.Provider>
    </UserContext.Provider>
  )
}

export default App
