import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import MainSearch from './components/MainSearch.jsx'
import Events from './pages/Events.jsx'
import Colleges from './pages/Colleges.jsx'
import Contact from './pages/Contact.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import CollegeDetails from './pages/CollegeDetails.jsx'
import EventDetail from './pages/EventDetail.jsx'
import StudentProfile from './pages/StudentProfile.jsx'
import MyParticipations from './pages/MyParticipations.jsx'
import App2 from './App2.jsx'
import Home from './pages/Home.jsx'
import AdminHome from './pages/Dashboard/AdminHome.jsx'
import AddEvent from './pages/Dashboard/AddEvent.jsx'
import StatPage from './components/Dashboard/StatPage.jsx'
import ShowEventsAdmin from './pages/Dashboard/ShowEventsAdmin.jsx'
import EventRegistrationsAdmin from './pages/Dashboard/EventRegistrationsAdmin.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<App />}>
        <Route path='' element={<App2 />}>
          <Route path='' element={<Home />} />
          <Route path='events' element={<Events />} />
          <Route path='colleges' element={<Colleges />} />
          <Route path='contact' element={<Contact />} />
          <Route path='collegeDetails/:dte_code' element={<CollegeDetails />} />
          <Route path='eventdetail/:eventId' element={<EventDetail />} />
          <Route path='studentprofile' element={<StudentProfile />} />
          <Route path='myparticipations' element={<MyParticipations />} />
        </Route>
        <Route path='register' element={<Register />} />
        <Route path='login' element={<Login />} />
        <Route path='admin' element={<AdminHome />}>
          <Route path='dashboard' element={<StatPage />} />
          <Route path='addevent' element={<AddEvent />} />
          <Route path='showeventsadmin' element={<ShowEventsAdmin />} />
          <Route path='eventdetail/:eventId' element={<EventDetail />} />
          <Route path='eventregistrationsadmin/:eventId' element={<EventRegistrationsAdmin />} />
        </Route>
      </Route>
    </>

  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
