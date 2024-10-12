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

  const handleDelete = () => {};
  const handleLikePost = () => {};

  const toggleTag = (tagId) => {
    setExpandedTags((prev) => ({ ...prev, [tagId]: !prev[tagId] }));
  };

  return (
    <>
      <div className='home w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor lg:rounded-lg h-screen overflow-hidden'>
        <TopBar />
        <div className='w-full flex gap-2 lg:gap-4 pt-5 pb-10 h-full'>
          {/* LEFT */}
          <div className='hidden w-1/3 lg:w-1/4 md:flex flex-col gap-4 overflow-y-auto'>
            <ProfileCard user={userInfo} />
            <FriendsCard friends={userInfo?.friends} />

            <div className='block lg:hidden'>
              <FriendsCard friends={userInfo?.friends} />
            </div>
          </div>

          {/* CENTER */}

            <div className=' flex-1 h-full bg-orimary px-4 flex flex-col gap-6 overflow-y-auto'>
              {loading ? (
                <Loading />
              ) : (
                <>
                  <div className='lg:hidden flex flex-col gap-6'>
                    <ProfileCard user={userInfo} />

                    {/* <div className='block lg:hidden'>
                      <FriendsCard friends={userInfo?.friends} />
                    </div> */}
                  </div>

                  <div className="">
                    {user?._id === id && (
                      <div className="bg-primary shadow-sm rounded-xl px-6 py-4 flex justify-between text-ascent-1 mb-1">
                        <div className="w-1/2 border-r flex justify-center mb-2">
                          <button className="w-full" onClick={() => setShowSavedPosts(false)}>Bài đăng</button>
                        </div>
                        <div className="w-1/2 flex justify-center mb-2">
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
                      <div className='flex w-full h-full items-center justify-center'>
                        <p className='text-lg text-ascent-2'>No Saved Post Available</p>
                      </div>
                    ) : (
                      <div className='flex w-full h-full items-center justify-center'>
                        <p className='text-lg text-ascent-2'>No Post Available</p>
                      </div>
                    )}

                  </div>
                </>
            )}
            </div>
            

          {/* RIGHT */}
          <div className='hidden w-1/4 h-full lg:flex flex-col gap-3 overflow-y-auto'>
            <div className="flex-1 bg-primary shadow-sm rounded-lg px-5 py-5 mb-1 overflow-y-auto">
              <div className='flex items-center justify-between text-xl text-ascent-1 pb-2 border-b border-[#66666645]'>
                <span>Files</span>
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
                        <ChevronUpIcon className="h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5" />
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

            <div className="flex-1 bg-primary shadow-sm rounded-lg px-5 py-5 mb-1 overflow-y-auto">
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
