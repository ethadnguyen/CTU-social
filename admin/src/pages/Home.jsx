import { React, useState } from "react";
import {
  EditProfile,
  ProfileCard,
  UserManagement,
  FacultiesSelector,
  TopBar,
  GroupRequests,
  ActivitiesCard,
} from "../components";
import { useSelector } from "react-redux";

const Home = () => {
  const { user, edit } = useSelector((state) => state.user);
  
  const [activeTab, setActiveTab] = useState("nhom");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      <div className="w-full h-screen px-0 pb-20 overflow-hidden lg:px-10 2xl:px-40 bg-bgColor lg:rounded-lg">
        <TopBar />
        <div className="flex w-full h-full gap-2 pt-5 pb-10 lg:gap-4">
          {/* Sidebar */}
          <div className="flex-col hidden w-1/3 h-full gap-3 overflow-y-auto lg:w-1/4 md:flex">
            <div className="hidden w-full md:flex flex-col"> 
              <ProfileCard user={user} /> 
            </div>
            
            <div className="rounded-md h-full">
              <ul className="bg-primary rounded-md h-full">
                <li
                  className={`pl-6 py-3 cursor-pointer hover:bg-gray text-ascent-1 ${
                    activeTab === "nhom" ? "bg-sky" : ""
                  } rounded-md`}
                  onClick={() => handleTabClick("nhom")}
                >
                  Yêu cầu tạo nhóm
                </li>
                <li
                  className={`pl-6 py-3 cursor-pointer hover:bg-gray text-ascent-1 ${
                    activeTab === "nguoiDung" ? "bg-sky" : ""
                  } rounded-md`}
                  onClick={() => handleTabClick("nguoiDung")}
                >
                  Quản lý người dùng
                </li>
                <li
                  className={`pl-6 py-3 cursor-pointer hover:bg-gray text-ascent-1 ${
                    activeTab === "khoa" ? "bg-sky" : ""
                  } rounded-md`}
                  onClick={() => handleTabClick("khoa")}
                >
                  Quản lý Khoa
                </li>
                <li
                  className={`pl-6 py-3 cursor-pointer hover:bg-gray text-ascent-1 ${
                    activeTab === "hoatDong" ? "bg-sky" : ""
                  } rounded-md`}
                  onClick={() => handleTabClick("hoatDong")}
                >
                  Quản lý Hoạt động
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col flex-1 h-full gap-6 px-4 overflow-y-auto bg-primary rounded-lg">
            {activeTab === "khoa" &&
              <div className="text-ascent-1 h-full">
                <FacultiesSelector />
              </div>
            }

            {activeTab === "nhom" && (
              <div className="h-full">
                <GroupRequests />
              </div>
            )}
            {activeTab === "nguoiDung" &&
              <div className="h-full">
                <UserManagement />
              </div>
            }
            {activeTab === "hoatDong" && (
              <div className="h-full">
                <ActivitiesCard />
              </div>
            )}
          </div>
        </div>
      </div>
      {edit && <EditProfile />}
    </>
  );
};

export default Home;