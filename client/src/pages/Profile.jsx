import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import {
  CustomButton,
  FriendsCard,
  Loading,
  PostCard,
  ProfileCard,
  TopBar,
} from "../components";
import { posts, savedPosts } from "../assets/home";
import { profile } from "../assets/profile";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { MdOutlineFileUpload } from "react-icons/md";

const Profile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  // const { posts } = useSelector((state) => state.posts);
  const [userInfo, setUserInfo] = useState(user);
  const [loading, setLoading] = useState(false);
  const [expandedTags, setExpandedTags] = useState({});

  const [showSavedPosts, setShowSavedPosts] = useState(false);

  const handleDelete = () => { };
  const handleLikePost = () => { };

  const toggleTag = (tagId) => {
    setExpandedTags((prev) => ({ ...prev, [tagId]: !prev[tagId] }));
  };

  return (
    <>
      <div className='w-full h-screen px-0 pb-20 overflow-hidden home lg:px-10 2xl:px-40 bg-bgColor lg:rounded-lg'>
        <TopBar />
        <div className='flex w-full h-full gap-2 pt-5 pb-10 lg:gap-4'>
          {/* LEFT */}
          <div className='flex-col hidden w-1/3 gap-4 overflow-y-auto lg:w-1/4 md:flex'>
            <ProfileCard user={userInfo} />
            <FriendsCard friends={userInfo?.friends} />

            <div className='block lg:hidden'>
              <FriendsCard friends={userInfo?.friends} />
            </div>
          </div>

          {/* CENTER */}

          <div className='flex flex-col flex-1 h-full gap-6 px-4 overflow-y-auto bg-orimary'>
            {loading ? (
              <Loading />
            ) : (
              <>
                <div className='flex flex-col gap-6 lg:hidden'>
                  <ProfileCard user={userInfo} />

                  {/* <div className='block lg:hidden'>
                      <FriendsCard friends={userInfo?.friends} />
                    </div> */}
                </div>

                <div className="">
                  {user?._id === id && (
                    <div className="flex justify-between px-6 py-4 mb-1 shadow-sm bg-primary rounded-xl text-ascent-1">
                      <div className="flex justify-center w-1/2 mb-2 border-r">
                        <button className="w-full" onClick={() => setShowSavedPosts(false)}>Bài đăng</button>
                      </div>
                      <div className="flex justify-center w-1/2 mb-2">
                        <button className="w-full" onClick={() => setShowSavedPosts(true)}>Bài đăng đã lưu</button>
                      </div>
                    </div>
                  )}

                  {posts?.length > 0 && !showSavedPosts ? (
                    posts?.map((post) => (
                      <PostCard
                        post={post}
                        key={post?._id}
                        user={user}
                        deletePost={handleDelete}
                        likePost={handleLikePost}
                      />
                    ))
                  ) : showSavedPosts && savedPosts?.length > 0 ? (
                    savedPosts.map((savedPost) => (
                      <PostCard
                        post={savedPost}
                        key={savedPost?._id}
                        user={user}
                        deletePost={handleDelete}
                        likePost={handleLikePost}
                      />
                    ))
                  ) : showSavedPosts ? (
                    <div className='flex items-center justify-center w-full h-full'>
                      <p className='text-lg text-ascent-2'>No Saved Post Available</p>
                    </div>
                  ) : (
                    <div className='flex items-center justify-center w-full h-full'>
                      <p className='text-lg text-ascent-2'>No Post Available</p>
                    </div>
                  )}

                </div>
              </>
            )}
          </div>


          {/* RIGHT */}
          <div className='flex-col hidden w-1/4 h-full gap-3 overflow-y-auto lg:flex'>
            <div className="flex-1 px-5 py-5 mb-1 overflow-y-auto rounded-lg shadow-sm bg-primary">
              <div className='flex items-center justify-between text-xl text-ascent-1 pb-2 border-b border-[#66666645]'>
                <span>Tài liệu</span>
                {user._id === id && <CustomButton

                  title='Thêm thẻ'
                  containerStyles='text-sm text-ascent-1 px-4 md:px-6 py-1 md:py-2 border border-[#666] rounded-full'
                />}
              </div>

              {profile.tags.map((tag) => (
                <div key={tag.id}>
                  <div
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div
                      onClick={() => toggleTag(tag.id)}
                      className="flex items-center cursor-pointer text-ascent-1"
                    >
                      <h4>{tag.name}</h4>
                      {expandedTags[tag.id] ? (
                        <ChevronUpIcon className="w-5 h-5" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5" />
                      )}
                    </div>
                    {user._id === id && <MdOutlineFileUpload className="ml-2 text-ascent-1" />}
                  </div>
                  {expandedTags[tag.id] && (
                    <ul>
                      {tag.files.map((file) => (
                        <li key={file.id}>
                          <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sky hover:underline">
                            {file.url.split('/').pop()}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="flex-1 px-5 py-5 mb-1 overflow-y-auto rounded-lg shadow-sm bg-primary">
              <div className='flex items-center justify-between text-xl text-ascent-1 pb-2 border-b border-[#66666645]'>
                <span>Nhóm</span>
                {user._id === id && <CustomButton

                  title='Tạo nhóm'
                  containerStyles='text-sm text-ascent-1 px-4 md:px-6 py-1 md:py-2 border border-[#666] rounded-full'
                />}
              </div>

              <ul className="gap-2">
                {profile.user.groups.map((group) => (
                  <li key={group.id} className="text-ascent-1">
                    <span className="mr-2">-</span>
                    <Link to={`/groups/${group.id}`} className="text-ascent-1 hover:underline">
                      {group.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
