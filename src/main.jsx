import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import MainSearch from './components/MainSearch.jsx'
import Events from './pages/Events.jsx'
import Organizations from './pages/Organizations.jsx'
import Contact from './pages/Contact.jsx'
import Register from './pages/Register.jsx'
import Signup from './pages/Signup.jsx'
import Login from './pages/Login.jsx'
import OrganizationDetails from './pages/OrganizationDetails.jsx'
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
import RegisterOrganization from './pages/Dashboard/RegisterOrganization.jsx'
import About from './pages/About.jsx'
import ContactUs from './pages/ContactUs.jsx'
import Blogs from './pages/Blogs.jsx'
import QueriesAdmin from './pages/Dashboard/QueriesAdmin.jsx'
import EventQueriesAdmin from './pages/Dashboard/EventQueriesAdmin.jsx'
import OrganizerProfile from './pages/OrganizerProfile.jsx'
import RootLogin from './pages/RootLogin.jsx'
import RootDashboard from './pages/RootDashboard/RootDashboard.jsx'
import RootEvents from './pages/RootDashboard/RootEvents.jsx'
import RootUsers from './pages/RootDashboard/RootUsers.jsx'
import RootUsersEnhanced from './pages/RootDashboard/RootUsersEnhanced.jsx'
import RootRegistrations from './pages/RootDashboard/RootRegistrations.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<App />}>
        <Route path='' element={<App2 />}>
          <Route path='' element={<Home />} />
          <Route path='events' element={<Events />} />
          <Route path='organizations' element={<Organizations />} />
          <Route path='contact' element={<Contact />} />
          <Route path='organizationDetails/:organizationId' element={<OrganizationDetails />} />
          <Route path='eventdetail/:eventId' element={<EventDetail />} />
          <Route path='studentprofile' element={<StudentProfile />} />
          <Route path='adminprofile' element={<OrganizerProfile />} />
          <Route path='myparticipations' element={<MyParticipations />} />
          <Route path='about' element={<About />} />
          <Route path='contactus' element={<ContactUs />} />
          <Route path='blogs' element={<Blogs />} />
          <Route path='organizationDetails/:id' element={<OrganizationDetails />} />
        </Route>
        <Route path='register' element={<Register />} />
        <Route path='signup' element={<Signup />} />
        <Route path='login' element={<Login />} />
        <Route path='admin' element={<AdminHome />}>
          <Route path='dashboard' element={<StatPage />} />
          <Route path='addevent' element={<AddEvent />} />
          <Route path='showeventsadmin' element={<ShowEventsAdmin />} />
          <Route path='eventdetail/:eventId' element={<EventDetail />} />
          <Route path='eventregistrationsadmin/:eventId' element={<EventRegistrationsAdmin />} />
          <Route path='registerorganization' element={<RegisterOrganization />} />
          <Route path='profile' element={<OrganizerProfile />} />
          <Route path='queries' element={<QueriesAdmin />} />
          <Route path='eventqueries/:eventId' element={<EventQueriesAdmin />} />
        </Route>
        {/* Root Routes */}
        <Route path='root/login' element={<RootLogin />} />
        <Route path='root/dashboard' element={<RootDashboard />} />
        <Route path='root/events' element={<RootEvents />} />
        <Route path='root/users' element={<RootUsers />} />
        <Route path='root/registrations' element={<RootRegistrations />} />
      </Route>
    </>

  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
