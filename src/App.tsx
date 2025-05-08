import React,{ Suspense, useEffect } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import './App.css';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDataFirst } from './redux/actions/user/userAction';
import { AppDispatch, RootState } from './redux/store';
import future from './types/createBrowserConfig.ts';

// Lazy Loading Components
const LandingPage = React.lazy(() => import('./pages/common/landingPage'));
const Login = React.lazy(() => import('./pages/common/login'));
const Signup = React.lazy(() => import('./pages/common/signup'));
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const Students = React.lazy(() => import('./pages/admin/Students'));
const DashboardHome = React.lazy(() => import('./pages/admin/DashboardHome'));
const Instructors = React.lazy(() => import('./pages/admin/Instructors'));
const Courses = React.lazy(() => import('./pages/admin/Courses'));
const Messages = React.lazy(() => import('./pages/admin/Messages'));
const Schedule = React.lazy(() => import('./pages/admin/Schedule'));
const Settings = React.lazy(() => import('./pages/admin/Settings'));
const UserForm = React.lazy(() => import('./pages/user/UserForm'));
const ProfilePage = React.lazy(() => import('./pages/common/ProfilePage'));
const DashboardLayout = React.lazy(() => import('./pages/instructor/DashboardLayout'));
const DashboardPage = React.lazy(() => import('./pages/instructor/Dashboard'));
const CoursesPage = React.lazy(() => import('./pages/instructor/CoursesPage'));
const AddCoursePage = React.lazy(() => import('./pages/instructor/AddCoursesPage'));
const InstructorRequestStatus = React.lazy(() => import('./pages/instructor/InstructorReqStatus'));
const Teach = React.lazy(() => import('./pages/user/Teach'));
const CategoriesPage = React.lazy(() => import('./pages/admin/Category'));
const CourseHomePage = React.lazy(() => import('./pages/common/CourseHomePage'));
const CourseDetailPage = React.lazy(() => import('./pages/common/CourseDetailPage'));
const PaymentDashboard = React.lazy(() => import('./pages/user/payment/paymentDashboard'));
const PaymentSuccess = React.lazy(() => import('./pages/user/payment/paymentSuccess'));
const PaymentFailure = React.lazy(() => import('./pages/user/payment/paymentFailure'));
const MyLearnings = React.lazy(() => import('./pages/user/MyLearnings'));
const InstructorDetails = React.lazy(() => import('./pages/user/InstuctorDetailsPage'));
const EditCoursePage = React.lazy(() => import('./pages/instructor/EditCoursePage'));
const BannerComponent = React.lazy(() => import('./pages/admin/Banner'));
const LearningCourseDetail = React.lazy(() => import('./pages/user/LearningCourseDetail'));
import PaymentHistory from './pages/user/payment/paymentHistory';
import ChatPage from './pages/instructor/ChatPage';
import Transactions from './pages/admin/Transactions';
import { TOBE } from './common/constants';
import { SocketProvider } from './context/SocketProvider';
const EarningsPage = React.lazy(() => import('./pages/instructor/EarningsPage'));
const AboutUs = React.lazy(() => import('./pages/common/AboutUs'));
const ContactUs = React.lazy(() => import('./pages/common/ContactUs'));

// Role-Based Redirect Component
const RoleBasedRedirect = ({ user }: { user: TOBE }) => {
  if (!user) return null;
  if (user?.isNewUser) return <Navigate to="/user-form" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return null;
};

// Define the routes using createBrowserRouter
const router = (user: TOBE) =>
  createBrowserRouter(
    [
      {
        path: '',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <RoleBasedRedirect user={user} />
            <LandingPage />
          </Suspense>
        ),
      },
      {
        path: '/course',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <CourseHomePage />
          </Suspense>
        ),
      },
      {
        path: '/details/:id',
        element: user ? (
          <Suspense fallback={<div>Loading...</div>}>
            <CourseDetailPage />
          </Suspense>
        ) : (
          <Login />
        ),
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
        element: user && user.isNewUser ? <UserForm /> : <Navigate to="/" replace />,
      },
      {
        path: '/profile',
        element: user ? (
          <Suspense fallback={<div>Loading...</div>}>
            <ProfilePage />
          </Suspense>
        ) : (
          <Navigate to="/" replace />
        ),
      },
      {
        path: 'instructor-req-stat',
        element: user?.role === 'instructor' && (
          <Suspense fallback={<div>Loading...</div>}>
            <InstructorRequestStatus />
          </Suspense>
        ),
      },
      {
        path: 'teach',
        element: user?.role === 'student' ? (
          <Suspense fallback={<div>Loading...</div>}>
            <Teach />
          </Suspense>
        ) : (
          <Navigate to="/" replace />
        ),
      },
      {
        path: '/instructor',
        element:
          user && user?.role === 'instructor' ? (
            <Suspense fallback={<div>Loading...</div>}>
              <DashboardLayout user={user} />
            </Suspense>
          ) : (
            <Navigate to="/" replace />
          ),
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'courses',
            element: <CoursesPage />,
          },
          {
            path: 'add-course',
            element: <AddCoursePage />,
          },
          {
            path: 'chat',
            element: <ChatPage/>
          },
          {
            path: 'earnings',
            element: <EarningsPage />
          }
        ],
      },
      {
        path: '/admin',
        element:
          user?.role === 'admin' ? (
            <Suspense fallback={<div>Loading...</div>}>
              <Dashboard user={user} />
            </Suspense>
          ) : (
            <Navigate to="/" replace />
          ),
        children: [
          { path: '', element: <DashboardHome /> },
          { path: 'students', element:<SocketProvider><Students /> </SocketProvider> },
          { path: 'instructors', element: <Instructors /> },
          { path: 'category', element: <CategoriesPage /> },
          { path: 'courses', element: <Courses /> },
          { path: 'messages', element: <Messages /> },
          { path: 'schedule', element: <Schedule /> },
          { path: 'banner', element: <BannerComponent /> },
          { path: 'settings', element: <Settings /> },
          { path: 'logout', element: <Navigate to="/" replace /> },
          { path: 'transactions', element: <Transactions /> },
          { path: '*', element: <Navigate to="/admin" replace /> },
        ],
      },
      {
        path: 'payment',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <PaymentDashboard user={user} />
          </Suspense>
        ),
        children: [
          { path: 'success/:courseId', element: <PaymentSuccess /> },
          { path: 'failed/:courseId', element: <PaymentFailure /> },
        ],
      },
      {
        path: 'my-learnings',
        element: (user ? (
          <Suspense fallback={<div>Loading...</div>}>
            <MyLearnings />
          </Suspense>):
          <Navigate to="/" replace />
        ),
      },
      {
        path: 'my-learnings/course/:id',
        element:  (
          user ? (
            <Suspense fallback={<div>Loading...</div>}>
              <LearningCourseDetail />
            </Suspense>
          ) : (
            <Navigate to="/" replace />
          )
        ),
      },
      {
        path: 'instructor/:id',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <InstructorDetails />
          </Suspense>
        ),
      },
      {
        path: 'edit-course',
        element: user?.role === 'instructor' && (
          <Suspense fallback={<div>Loading...</div>}>
            <EditCoursePage />
          </Suspense>
        ),
      },
      {
        path: "payment/history",
        element: user && (
          <Suspense fallback={<div>Loading...</div>}>
            <PaymentHistory />
          </Suspense>
        )
      },
      {
        path: "contact-us",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ContactUs />
          </Suspense>
        )
      },
      {
        path: "about-us",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <AboutUs />
          </Suspense>
        )
      }
    ],
    { future }
  );

const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!user) dispatch(getUserDataFirst());
  }, [user, dispatch]);

  return <RouterProvider router={router(user)} future={{ v7_startTransition: true }} />;
};

export default App;
