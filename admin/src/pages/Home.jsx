import React, { useState } from "react";
import {
  EditProfile,
  ProfileCard,
  PostRequests,
  FacultiesSelector,
  TopBar,
  GroupRequests,
  ActivitiesCard,
} from "../components";
import { useSelector } from "react-redux";

const Home = () => {
  const { user, edit } = useSelector((state) => state.user);
  
  const [activeTab, setActiveTab] = useState("khoa");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      <div className="flex flex-col bg-bgColor h-screen">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="h-full w-1/4 mb-3">
            <div className="hidden w-full md:flex flex-col p-4"> 
              <ProfileCard user={user} /> 
            </div>
            
            <div className="rounded-md p-4 h-full">
              <ul className="bg-primary rounded-md h-full">
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
                    activeTab === "nhom" ? "bg-sky" : ""
                  } rounded-md`}
                  onClick={() => handleTabClick("nhom")}
                >
                  Yêu cầu tạo nhóm
                </li>
                <li
                  className={`pl-6 py-3 cursor-pointer hover:bg-gray text-ascent-1 ${
                    activeTab === "baiDang" ? "bg-sky" : ""
                  } rounded-md`}
                  onClick={() => handleTabClick("baiDang")}
                >
                  Quản lý Bài đăng
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
          <div className="flex-1 p-4 gap-4 mt-4 mr-4 bg-primary rounded-md h-full">
            {activeTab === "khoa" &&
              <div className="text-ascent-1">
                <FacultiesSelector />
              </div>
            }

            {activeTab === "nhom" && (
              <div>
                <GroupRequests />
              </div>
            )}
            {activeTab === "baiDang" &&
              <div>
                <PostRequests />
              </div>
            }
            {activeTab === "hoatDong" && (
              <div>
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