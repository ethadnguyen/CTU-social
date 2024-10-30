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
      <div className="flex flex-col bg-bgColor h-screen">
        <TopBar />
        <div className="flex flex-1">
          {/* Sidebar */}
          <div className="h-[90%] w-1/4 mb-3 overflow-y-auto">
            <div className="hidden w-full md:flex flex-col p-4"> 
              <ProfileCard user={user} /> 
            </div>
            
            <div className="rounded-md p-4 h-80">
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
          <div className="flex-1 p-4 gap-4 mt-4 mr-4 bg-primary rounded-md h-[88%]">
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