import { Outlet, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Home, Login, Profile, Register, ResetPassword, Group, Messages, Notifications, Post, Search } from "./pages";
import Modal from 'react-modal';
import { TopBar } from './components';
import useSocket from './hooks/useSocket';

Modal.setAppElement('#root');

function Layout() {
  const { user } = useSelector((state) => state.user);
  const token = localStorage.getItem("token");
  const location = useLocation();

  return token ? (
    <>
      <TopBar friends={user.friends} />
      <Outlet />
    </>
  ) : (
    <Navigate to='/login' state={{ from: location }} replace />
  );
}

function App() {
  const { theme } = useSelector((state) => state.theme);
  useSocket();
  return (
    <div data-theme={theme} className='w-full min-h-[100vh]'>
      <Routes>
        <Route element={<Layout />}>
          <Route path='/' element={<Home />} />
          <Route path='/profile/:id?' element={<Profile />} />
          <Route path='/group/:id?' element={<Group />} />
          <Route path='/messages/:id?' element={<Messages />} />
          <Route path='/notifications/:id?' element={<Notifications />} />
          <Route path='/posts/:id?' element={<Post />} />
          <Route path='/search/:searchQuery' element={<Search />} />
        </Route>

        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/reset-password' element={<ResetPassword />} />
      </Routes>
    </div>
  );
}

export default App;
