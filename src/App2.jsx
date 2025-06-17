import React, { useState, useEffect, createContext } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import FooterComp from './components/FooterComp'

function App2() {
  return (
    <>
      <Navbar />
      <div className='h-20 lg:h-30'></div>
      <div className='2xl:mx-[200px] px-4'>
        <Outlet />
      </div>
      <FooterComp />
      <ToastContainer />
    </>
  )
}

export default App2
