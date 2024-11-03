import { React, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CustomButton,
  FriendsCard,
  TextInput,
} from "../components";
import { LiaEditSolid } from "react-icons/lia";
import { BsPersonFillAdd } from "react-icons/bs";
import { faculties } from "../assets/home";
import { suggest, requests } from "../assets/data";
import { NoProfile } from "../assets";
import { useForm } from "react-hook-form";
import moment from "moment";

import { UpdateProfile } from "../redux/userSlice";

const Menu = ({ user, friends, searchQuery }) => {
  const { user: data } = useSelector((state) => state.user);
  const [friendRequest, setFriendRequest] = useState(requests);
  const [suggestedFriends, setSuggestedFriends] = useState(suggest);
  const dispatch = useDispatch();
  const location = useLocation();
  const [showActivities, setShowActivities] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState(searchQuery || "");
  
  const handleSearch = () => {
    if (inputValue.trim() !== '')
      navigate(`/search/${inputValue}`);
  };

  useEffect(() => {
    if (user && user.facultyId) {
      setSelectedFaculty(user.facultyId);
    } else {
      setSelectedFaculty('');
    }
  }, [user]);

  return (
    <div className="lg:hidden absolute top-12 left-4 bg-primary border border-gray-300 rounded-md shadow-md">
        <ul className="py-2 text-ascent-1">
          <li className="px-4 py-2 hover:bg-gray-100 flex items-center">
              <Link to={`/profile/${user._id}`}>Hồ sơ</Link>
              <div className='ml-5'>
              {user?._id === data?._id && (
                location.pathname === "/" && (
                  <LiaEditSolid
                    size={22}
                    className='text-blue cursor-pointer'
                    onClick={() => dispatch(UpdateProfile(true))}
                  />
                )
              )}
              
              {user?._id !== data?._id && (
                <button
                  className='bg-[#0444a430] text-sm text-white p-1 rounded'
                  onClick={() => {}}
                >
                  <BsPersonFillAdd size={20} className='text-[#0f52b6]' />
                </button>
              )}
            </div>
          </li>

          {/* <li className="px-4 py-2 hover:bg-gray-100">
              <Link to="/notifications/${user._id}">Thông báo</Link>
          </li> */}

          <li className="px-4 py-2 hover:bg-gray-100" onClick={() => setShowFriends(true)}>
              <span>Bạn bè</span>
              {friendRequest?.length > 0 && (
                <div className='ml-2 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red border-3 border-white rounded-full -top-2 -end-2'>
                  <span className='text-sm text-white'>{friendRequest?.length}</span>
                </div>
              )}
          </li>

          {/* <li className="px-4 py-2 hover:bg-gray-100 relative">
              <Link to="/messages/${user._id}">Tin nhắn</Link>
              <div className='absolute inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red border-3 border-white rounded-full top-3 end-3'>
                <span className='text-sm text-white'>{user?.messages?.length}</span>
              </div>
          </li> */}

          <li className="px-4 py-2 hover:bg-gray-100" onClick={() => setShowActivities(true)}>
              <span>Hoạt động</span>
          </li>

          <li className="px-4 py-2 hover:bg-gray-100" onClick={() => setShowSearch(true)}>
              Tìm kiếm
          </li>
        </ul>

        {/* Bạn bè Modal */}
        {showFriends && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50">
            <div className="bg-white w-full h-full rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Bạn bè</h2>
                  <button
                    onClick={() => setShowFriends(false)}
                    className="text-ascent-1 text-xl font-bold"
                  >
                    X
                  </button>
                </div>
              <div className="bg-white w-full h-[90%] rounded-lg p-4 relative overflow-y-auto">

                {/* Nội dung của thẻ Bạn bè */}
                {/* FRIEND REQUEST */}
                <div className='flex-1 bg-primary shadow-sm rounded-lg px-5 py-5 overflow-y-auto' style={{ maxHeight: '300px' }}>
                  <div className='flex items-center justify-between text-xl text-ascent-1 pb-2 border-b border-[#66666645]'>
                    <span>Yêu Cầu Kết Bạn</span>
                    <span>{friendRequest?.length}</span>
                  </div>

                  <div className='w-full flex flex-col gap-4 pt-4'>
                    {friendRequest?.map(({ _id, requestFrom: from }) => (
                      <div key={_id} className='flex items-center justify-between'>
                        <Link
                          to={"/profile/" + from._id}
                          className='w-full flex gap-4 items-center cursor-pointer'
                        >
                          <img
                            src={from?.profileUrl ?? NoProfile}
                            alt={from?.firstName}
                            className='w-10 h-10 object-cover rounded-full'
                          />
                          <div className='flex-1'>
                            <p className='text-base font-medium text-ascent-1'>
                              {from?.firstName} {from?.lastName}
                            </p>
                          </div>
                        </Link>

                        <div className='flex gap-1'>
                          <CustomButton
                            title='Accept'
                            containerStyles='bg-[#0444a4] text-xs text-white px-1.5 py-1 rounded-full'
                          />
                          <CustomButton
                            title='Deny'
                            containerStyles='border border-[#666] text-xs text-ascent-1 px-1.5 py-1 rounded-full'
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SUGGESTED FRIENDS */}
                <div className='flex-1 bg-primary shadow-sm rounded-lg px-5 py-5 overflow-y-auto' style={{ maxHeight: '300px' }}>
                  <div className='flex items-center justify-between text-lg text-ascent-1 border-b border-[#66666645]'>
                    <span>Gợi Ý Kết Bạn</span>
                  </div>
                  <div className='w-full flex flex-col gap-4 pt-4'>
                    {suggestedFriends?.map((friend) => (
                      <div
                        className='flex items-center justify-between'
                        key={friend._id}
                      >
                        <Link
                          to={"/profile/" + friend?._id}
                          key={friend?._id}
                          className='w-full flex gap-4 items-center cursor-pointer'
                        >
                          <img
                            src={friend?.profileUrl ?? NoProfile}
                            alt={friend?.firstName}
                            className='w-10 h-10 object-cover rounded-full'
                          />
                          <div className='flex-1 '>
                            <p className='text-base font-medium text-ascent-1'>
                              {friend?.firstName} {friend?.lastName}
                            </p>
                          </div>
                        </Link>

                        <div className='flex gap-1'>
                          <button
                            className='bg-[#0444a430] text-sm text-white p-1 rounded'
                            onClick={() => {}}
                          >
                            <BsPersonFillAdd size={20} className='text-[#0f52b6]' />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FRIENDS */}
                <FriendsCard friends={user?.friends} />

              </div>
            </div>
          </div>
        )}

        {showActivities && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50">
            <div className="bg-white w-full h-full rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold"></h2>
                  <button
                    onClick={() => setShowActivities(false)}
                    className="text-ascent-1 text-xl font-bold"
                  >
                    X
                  </button>
                </div>
              <div className="bg-white w-full h-[90%] rounded-lg p-4 relative overflow-y-auto">
              
                <div className='flex items-center justify-between text-lg text-ascent-1 border-b border-[#66666645]'>
                  <span>Hoạt Động</span>
                  <label>
                    <select
                      value={selectedFaculty}
                      onChange={(e) => setSelectedFaculty(e.target.value)}
                      className={`bg-secondary border-[#66666690] mb-2 outline-none text-sm text-ascent-2 placeholder:text-[#666] w-full border rounded-md py-2 px-3 mt-1`}
                    >
                      {faculties.map((faculty) => (
                        <option key={faculty.id} value={faculty.id}>
                          {faculty.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                
                <div className='w-full flex flex-col gap-4 pt-4'>
                  {faculties
                    .find((faculty) => faculty.id === selectedFaculty) // Tìm khoa được chọn
                    ?.activities.map((activity) => ( // Hiển thị activities của khoa được chọn
                      <div key={activity.id} className='flex flex-col'>
                        <a
                          href={activity.link}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-base font-medium text-ascent-1 hover:underline'
                        >
                          {activity.title}
                        </a>
                        <img
                          src={activity.image}
                          alt={activity.title}
                          className='w-full h-48 object-cover rounded-md'
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
      )}

      {showSearch && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center overflow-y">
          <div className="bg-white w-11/12 md:w-1/2 lg:w-1/3 rounded-lg shadow-lg p-4 relative">
            <div className="flex justify-between items-center mb-4">
              <div></div>
              <button onClick={() => setShowSearch(false)} className="text-ascent-1 text-xl font-bold">
                X
              </button>
            </div>

            {/* Nội dung tìm kiếm */}
            <form
              className='md:flex items-center justify-center'
              onSubmit={handleSubmit(handleSearch)}
            >
              <div className="flex">
                <TextInput
                  placeholder='Tìm kiếm...'
                  styles='w-full rounded-l-full py-3 '
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  register={register("search")}
                />
                <CustomButton
                  title='Search'
                  type='submit'
                  containerStyles='bg-blue hover:bg-sky mt-2 text-white px-3 py-2.5 rounded-r-full'
                />
              </div>
            </form>

          </div>
        </div>
        )}

    </div>
  );
};

export default Menu;
