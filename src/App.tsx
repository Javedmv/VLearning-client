import { createBrowserRouter ,Navigate } from 'react-router-dom';
import './App.css'

import LandingPage from './pages/common/landingPage'
import Login from './pages/common/login' 
import Signup from './pages/common/signup'
import Dashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import DashboardHome from './pages/admin/DashboardHome';
import Instructors from './pages/admin/Instructors';
import Courses from './pages/admin/Courses';
import Messages from './pages/admin/Messages';
import Schedule from './pages/admin/Schedule';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';

// Define the routes using createBrowserRouter
const router = createBrowserRouter([
  {
    path:'',
    element:<LandingPage/>
  },
  {
    path:'/login',
    element:<Login/>
  },
  {
    path:"/signup",
    element:<Signup/>
  },
  {
    path: '/admin',
    element: <Dashboard />,
    children: [
      {
        path: '',
        element: <DashboardHome />,
      },
      {
        path: 'students',
        element: <Students />,
      },
      {
        path: 'instructors',
        element: <Instructors />,
      },
      {
        path: 'courses',
        element: <Courses />,
      },
      {
        path: 'messages',
        element: <Messages />,
      },
      {
        path: 'schedule',
        element: <Schedule />,
      },
      {
        path: 'analytics',
        element: <Analytics />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'logout',
        element: <Navigate to="/" replace />,
      },
      {
        path: '*',
        element: <Navigate to="/admin" replace />,
      },
    ],
  },
]);

export default router;
