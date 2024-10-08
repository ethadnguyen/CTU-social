import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Loading, PostCard, TopBar } from "../components";
import { posts } from "../assets/home";
//import { getPostsByGroup } from "../redux/postSlice";

const Group = () => {
  const { id } = useParams(); 
  const dispatch = useDispatch();
  //const { posts, loading } = useSelector((state) => state.posts);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.user);

//   useEffect(() => {
//     dispatch(getPostsByGroup(id));
//   }, [dispatch, id]);

  const handleDelete = () => {};
  const handleLikePost = () => {};

  return (
    <div className="home w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor lg:rounded-lg h-screen overflow-hidden">
      <TopBar />
      <div className="w-full flex gap-2 lg:gap-4 pt-5 pb-10 h-full">
        {/* ... (You can add sidebars or other content here if needed) ... */}

        <div className="flex-1 h-full bg-orimary px-4 flex flex-col gap-6 overflow-y-auto">
          {loading ? (
            <Loading />
          ) : posts?.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                user={user}
                deletePost={handleDelete}
                likePost={handleLikePost}
              />
            ))
          ) : (
            <div className="flex w-full h-full items-center justify-center">
              <p className="text-lg text-ascent-2">No Posts in this group yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Group;