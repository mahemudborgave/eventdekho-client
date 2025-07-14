import React, { useState, useEffect, createContext } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import FooterComp from './components/FooterComp'
import ScrollToTop from './components/ScrollToTop'
import { usePageTracking } from './hooks/usePageTracking'

function App2() {
  // Track page visits for smart redirects
  usePageTracking();

  return (
    <>
      <Navbar />
      <div className='h-20 lg:h-30'></div>
      <div className='2xl:px-[200px] px-5'>
        <Outlet />
      </div>
      <FooterComp />
      <ScrollToTop />
      {/* <ToastContainer /> */}
    </>
  )
}

export default App2
