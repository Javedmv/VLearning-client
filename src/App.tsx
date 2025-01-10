import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import './App.css';
import future from './types/createBrowserConfig';

import LandingPage from './pages/common/landingPage';
import Login from './pages/common/login';
import Signup from './pages/common/signup';
import Dashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import DashboardHome from './pages/admin/DashboardHome';
import Instructors from './pages/admin/Instructors';
import Courses from './pages/admin/Courses';
import Messages from './pages/admin/Messages';
import Schedule from './pages/admin/Schedule';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import UserForm from './pages/user/UserForm';
import { AppDispatch, RootState } from './redux/store';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDataFirst } from './redux/actions/user/userAction';
import ProfilePage from './pages/common/ProfilePage';
import DashboardLayout from './pages/instructor/DashboardLayout';
import DashboardPage from './pages/instructor/Dashboard';
import CoursesPage from './pages/instructor/CoursesPage';
import AddCoursePage from './pages/instructor/AddCoursesPage';
import InstructorRequestStatus from './pages/instructor/InstructorReqStatus';
import Teach from './pages/user/Teach';
import CategoriesPage from './pages/admin/Category';
import CourseHomePage from './pages/common/CourseHomePage';

// Role-Based Redirect Component
const RoleBasedRedirect = ({ user }: { user: any }) => {
  if (!user) return null; // Do nothing if user isn't loaded yet

  if (user.isNewUser) return <Navigate to="/user-form" replace />; // Redirect new users to /user-form

  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return null;
};

// Define the routes using createBrowserRouter
const router = (user: any) =>
  createBrowserRouter(
    [
      {
        path: '',
        element: (
          <>
            <RoleBasedRedirect user={user} />
            <LandingPage />
          </>
        ),
      },
      {
        path:"/course",
        element: <CourseHomePage/>
      },
      {
        path: '/login',
        element: user ? <Navigate to="/" replace /> : <Login />,
      },
      {
        path: '/signup',
        element: user ? <Navigate to="/" replace /> : <Signup />,
      },
      {
        path: '/user-form',
        element:
          user && user.isNewUser ? (
            <UserForm />
          ) : (
            <Navigate to="/" replace />
          ), // Restrict access to /user-form
      },
      {
        path: '/profile',
        element: (
           user ? <ProfilePage /> : <Navigate to="/" replace />
        )
      },
      {
        path:"instructor-req-stat",
        element: user?.role === "instructor" && <InstructorRequestStatus />
      },
      {
        path:"teach",
        element: user?.role === "student" ? <Teach/> : <Navigate to="/" replace />
      },
      {
        path:"/instructor",
        element: (user && user?.role === 'instructor' ? <DashboardLayout user={user}/> : <Navigate to="/" replace />),
        children : [
          {
            index:true,
            element: <DashboardPage />
          },
          {
            path:"courses",
            element:<CoursesPage/>
          },
          {
            path:"add-course",
            element: <AddCoursePage/>
          },
        ]
      },
      {
        path: '/admin',
        element: user?.role === 'admin' ? <Dashboard user={user}/> : <Navigate to="/" replace />,
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
            path: 'category',
            element: <CategoriesPage />
          }
          ,
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
      }
    ],
    // this is given to remove the warning in browser
    { future }
  );

const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.user);
  // console.log(user, 'user in app.tsx');

  useEffect(() => {
    if (!user) {
      dispatch(getUserDataFirst());
    }
  }, [user, dispatch]);


  return <RouterProvider router={router(user)} future={{v7_startTransition: true}} />;
};

export default App;

