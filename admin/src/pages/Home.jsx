import { React, useState } from "react";
import { Link } from "react-router-dom";
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
import { groups } from "../assets/groups";

const Home = () => {
  const { user, edit } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("nhom");
  const [searchTerm, setSearchTerm] = useState("");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleDeleteGroup = (groupId) => {
    console.log("Xóa nhóm: ", groupId);
    //xử lý xóa nhóm
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
                    activeTab === "quanLyNhom" ? "bg-sky" : ""
                  } rounded-md`}
                  onClick={() => handleTabClick("quanLyNhom")}
                >
                  Quản lý nhóm
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
            {activeTab === "khoa" && (
              <div className="text-ascent-1 h-full">
                <FacultiesSelector />
              </div>
            )}

            {activeTab === "nhom" && (
              <div className="h-full">
                <GroupRequests />
              </div>
            )}
            {activeTab === "quanLyNhom" && (
              <div className="h-full">
                {/* Search Bar */}
                <div className="mb-4 mt-2 border-b border-gray">
                  <input
                    type="text"
                    placeholder="Tìm kiếm nhóm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 mb-5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {groups
                  ?.filter((group) =>
                    group.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((group) => (
                    <div key={group.id} className="flex items-center mb-2">
                      {/* Add flex and items-center to the container */}
                      <div className="rounded-md flex flex-col bg-primary py-3 px-3 w-full">
                        {/* Add w-full to make the group info take available space */}
                        <div className="relative">
                          <img
                            src={group?.banner ?? "../src/assets/empty.jpg"}
                            alt={group?.name}
                            className="object-cover rounded-md w-full h-20"
                          />
                          <Link
                            to={`http://localhost:5173/group/${group?.id}`}
                            className="flex absolute h-20 w-full top-0"
                            target="_blank"
                          >
                            <div className="flex-grow flex flex-col justify-center bg-secondary bg-opacity-70 hover:opacity-0 transition-opacity duration-300">
                              <p className="ml-1 text-lg font-medium text-ascent-1">
                                {group?.name}
                              </p>
                              <p className="ml-1 text-base text-ascent-2">
                                {group?.description
                                  ?.split(" ")
                                  .slice(0, 30)
                                  .join(" ") +
                                  (group?.description?.split(" ").length > 30
                                    ? "..."
                                    : "")}
                              </p>
                            </div>
                          </Link>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="bg-red hover:bg-primary hover:text-red text-white font-bold py-2 px-4 rounded-md ml-2" // Add some left margin
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                {groups?.filter((group) =>
                  group.name.toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 && (
                  <div className="flex items-center justify-center w-full h-full">
                    <p className="text-lg text-ascent-2">Không có nhóm nào</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === "nguoiDung" && (
              <div className="h-full">
                <UserManagement />
              </div>
            )}
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
