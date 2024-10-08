import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Activity from './pages/Activity';
import Faculty from './pages/Faculty';
import Request from './pages/Request';
import Account from './pages/Account';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
function Layout() {
  // const { user } = useSelector((state) => state.user);
  const token = localStorage.getItem("token");
  const location = useLocation();

  return token ? (
    <Outlet />
  ) : (
    <Navigate to='/login' state={{ from: location }} replace />
  );
}



function App() {
  const { theme } = useSelector((state) => state.theme);
  return (
    <div data-theme={theme} className='w-full min-h-[100vh]'>
      <Routes>
        <Route element={<Layout />}>
          <Route path='/' element={<Home />} />
          <Route path='/profile/:id?' element={<Profile />} />
          <Route path='/activities' element={<Activity />} />
          <Route path='/faculties' element={<Faculty />} />
          <Route path='/requests' element={<Request />} />
          <Route path='/accounts' element={<Account />} />
        </Route>

        <Route path='/login' element={<Login />} />
        <Route path='/reset-password' element={<ResetPassword />} />
      </Routes>
    </div>
  )
}

export default App
