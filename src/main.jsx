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
import OrganizerHome from './pages/OrganizerDashboard/OrganizerHome.jsx'
import AddEvent from './pages/OrganizerDashboard/AddEvent.jsx'
import StatPage from './components/OrganizerDashboard/StatPage.jsx'
import ShowEventsOrganizer from './pages/OrganizerDashboard/ShowEventsOrganizer.jsx'
import EventRegistrationsOrganizer from './pages/OrganizerDashboard/EventRegistrationsOrganizer.jsx'
import RegisterOrganization from './pages/OrganizerDashboard/RegisterOrganization.jsx'
import About from './pages/About.jsx'
import ContactUs from './pages/ContactUs.jsx'
import Blogs from './pages/Blogs.jsx'
import QueriesOrganizer from './pages/OrganizerDashboard/QueriesOrganizer.jsx'
import EventQueriesOrganizer from './pages/OrganizerDashboard/EventQueriesOrganizer.jsx'
import OrganizerProfile from './pages/OrganizerProfile.jsx'
import RootLogin from './pages/RootLogin.jsx'
import RootDashboard from './pages/RootDashboard/RootDashboard.jsx'
import RootEvents from './pages/RootDashboard/RootEvents.jsx'
import RootUsers from './pages/RootDashboard/RootUsers.jsx'
import RootUsersEnhanced from './pages/RootDashboard/RootUsersEnhanced.jsx'
import RootRegistrations from './pages/RootDashboard/RootRegistrations.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Wishlist from './pages/Wishlist.jsx';
import BlogRead from './pages/BlogRead.jsx';
import TransactionsOrganizer from './pages/OrganizerDashboard/TransactionsOrganizer.jsx';
import { ThemeProvider } from './components/ui/ThemeProvider';
import RootEventDetail from './pages/RootDashboard/RootEventDetail.jsx';
import RootOrganizations from './pages/RootDashboard/RootOrganizations.jsx';
import RootOrgEvents from './pages/RootDashboard/RootOrgEvents.jsx';
import RootOrgEventTransactions from './pages/RootDashboard/RootOrgEventTransactions.jsx';
import EventRegistrationPage from './pages/EventRegistrationPage';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<GoogleOAuthProvider clientId="1003672145264-datm5nj7uabjeaj07ehfpcbau1lhr1ck.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>}>
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
          <Route path='blog/:id' element={<BlogRead />} />
          <Route path='wishlist' element={<Wishlist />} />
          <Route path='organizationDetails/:id' element={<OrganizationDetails />} />
        </Route>
        <Route path='register' element={<Register />} />
        <Route path='signup' element={<Signup />} />
        <Route path='login' element={<Login />} />
        <Route path='eventregister/:eventId' element={<EventRegistrationPage />} />
        <Route path='admin' element={<OrganizerHome />}>
          <Route path='dashboard' element={<StatPage />} />
          <Route path='addevent' element={<AddEvent />} />
          <Route path='showeventsadmin' element={<ShowEventsOrganizer />} />
          <Route path='eventdetail/:eventId' element={<EventDetail />} />
          <Route path='eventregistrationsadmin/:eventId' element={<EventRegistrationsOrganizer />} />
          <Route path='registerorganization' element={<RegisterOrganization />} />
          <Route path='profile' element={<OrganizerProfile />} />
          <Route path='queries' element={<QueriesOrganizer />} />
          <Route path='eventqueries/:eventId' element={<EventQueriesOrganizer />} />
          {/* <Route path='transactions' element={<TransactionsOrganizer />} /> */}
        </Route>
        {/* Root Routes */}
        <Route path='root/login' element={<RootLogin />} />
        <Route path='root/dashboard' element={<RootDashboard />} />
        <Route path='root/events' element={<RootEvents />} />
        <Route path='root/users' element={<RootUsers />} />
        <Route path='root/organizations' element={<RootOrganizations />} />
        <Route path='root/registrations' element={<RootRegistrations />} />
        <Route path='root/org-event/:eventId' element={<div>Event detail page placeholder</div>} />
        <Route path='root/eventdetail/:eventId' element={<RootEventDetail />} />
        <Route path='root/org-events/:email' element={<RootOrgEvents />} />
        <Route path='root/org-event-transactions/:eventId' element={<RootOrgEventTransactions />} />
      </Route>
    </>

  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
