import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import moment from "moment";
import { NoProfile } from "../assets";
import { BiComment, BiLike, BiSolidLike } from "react-icons/bi";
import { CiShare2, CiMenuKebab } from "react-icons/ci";
import { MdOutlineReportProblem } from "react-icons/md";
import { useForm } from "react-hook-form";
import TextInput from "./TextInput";
import Loading from "./Loading";
import CustomButton from "./CustomButton";
import { postComments } from "../assets/home";
import { useSelector } from "react-redux";
import { ImageDetail } from ".";

const ReplyCard = ({ reply, user, handleLike }) => {
  return (
    <div className='w-full py-3'>
      <div className='flex gap-3 items-center mb-1'>
        <Link to={"/profile/" + reply?.userId?._id}>
          <img
            src={reply?.userId?.profileUrl ?? NoProfile}
            alt={reply?.userId?.firstName}
            className='w-10 h-10 rounded-full object-cover'
          />
        </Link>

        <div>
          <Link to={"/profile/" + reply?.userId?._id}>
            <p className='font-medium text-base text-ascent-1'>
              {reply?.userId?.firstName} {reply?.userId?.lastName}
            </p>
          </Link>
          <span className='text-ascent-2 text-sm'>
            {moment(reply?.createdAt).fromNow()}
          </span>
        </div>
      </div>

      <div className='ml-12'>
        <p className='text-ascent-2 '>{reply?.comment}</p>
        <div className='mt-2 flex gap-6'>
          <p
            className='flex gap-2 items-center text-base text-ascent-2 cursor-pointer'
            onClick={handleLike}
          >
            {reply?.likes?.includes(user?._id) ? (
              <BiSolidLike size={20} color='blue' />
            ) : (
              <BiLike size={20} />
            )}
            {reply?.likes?.length}
          </p>
        </div>
      </div>
    </div>
  );
};

const CommentForm = ({ user, id, replyAt, getComments }) => {
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const onSubmit = async (data) => {};

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='w-full border-b border-[#66666645]'
    >
      <div className='w-full flex items-center gap-2 py-4'>
        <img
          src={user?.profileUrl ?? NoProfile}
          alt='User Image'
          className='w-10 h-10 rounded-full object-cover'
        />

        <TextInput
          name='comment'
          styles='w-full rounded-full py-3'
          placeholder={replyAt ? `Reply @${replyAt}` : "Bình luận bài đăng"}
          register={register("comment", {
            required: "Bình luận không được để trống",
          })}
          error={errors.comment ? errors.comment.message : ""}
        />
      </div>
      {errMsg?.message && (
        <span
          role='alert'
          className={`text-sm ${
            errMsg?.status === "failed"
              ? "text-[#f64949fe]"
              : "text-[#2ba150fe]"
          } mt-0.5`}
        >
          {errMsg?.message}
        </span>
      )}

      <div className='flex items-end justify-end pb-2'>
        {loading ? (
          <Loading />
        ) : (
          <CustomButton
            title='Bình luận'
            type='submit'
            containerStyles='bg-[#0444a4] text-white py-1 px-3 rounded-full font-semibold text-sm hover:bg-sky'
          />
        )}
      </div>
    </form>
  );
};

const PostCard = ({ post, user, deletePost, likePost }) => {
  const { theme } = useSelector((state) => state.theme);
  const [showAll, setShowAll] = useState(0);
  const [showReply, setShowReply] = useState(0);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyComments, setReplyComments] = useState(0);
  const [showComments, setShowComments] = useState(0);

  const getComments = async () => {
    setReplyComments(0);

    setComments(postComments);
    setLoading(false);
  };
  const handleLike = async () => {};

  const navigate = useNavigate();
  const location = useLocation();

  const handleImageClick = () => {
    setShowImageModal(true);
  };
  const [showImageModal, setShowImageModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className='mb-2 bg-primary p-4 rounded-xl'>
      {showImageModal && (
        <ImageDetail
          images={post.image} 
          onClose={() => setShowImageModal(false)} 
        />
      )}
      <div className='flex gap-3 items-center mb-2'>
        <Link to={"/profile/" + post?.userId?._id}>
          <img
            src={post?.userId?.profileUrl ?? NoProfile}
            alt={post?.userId?.firstName}
            className='w-16 h-13 object-cover rounded-full'
          />
        </Link>

        <div className='w-full flex justify-between'>
          <div className=''>
            <Link to={"/profile/" + post?.userId?._id}>
              <p className='font-medium text-lg text-ascent-1'>
                {post?.userId?.lastName} {post?.userId?.firstName}
              </p>
            </Link>
            <span className='text-ascent-2'>
              {post?.userId?.major ? (
                <>{post?.userId?.faculty}, {post?.userId?.major}</>
                ) : (
                <>{post?.userId?.faculty || post?.userId?.major}</>
              )}
      </span>
          </div>

          <span className='flex item-centers gap-4 text-ascent-2'>
            {moment(post?.createdAt ?? "2023-05-25").fromNow()}
            <div className='relative'>
              <CiMenuKebab className='text-ascent-1 h-full text-lg' onClick={() => setShowMenu(!showMenu)} />
              {showMenu && (
                <div className="absolute top-0 end-5 bg-primary border border-gray-300 rounded-md z-50">
                  <ul className="py-1 text-ascent-1 itemscenters px-2">
                    <li className='py-1'>Lưu</li>
                    <li className='py-1'><span>Chia&nbsp;sẻ</span></li>
                    {user?._id === post?.userId?._id && (
                      <li className='py-1' onClick={() => deletePost(post._id)}>Xóa</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </span>
        </div>
      </div>

      <div>
        <p className='text-ascent-2'>
          {showAll === post?._id
            ? post?.description
            : post?.description.slice(0, 300)}

          {post?.description?.length > 301 &&
            (showAll === post?._id ? (
              <span
                className='text-blue ml-2 font-mediu cursor-pointer'
                onClick={() => setShowAll(0)}
              >
                Show Less
              </span>
            ) : (
              <span
                className='text-blue ml-2 font-medium cursor-pointer'
                onClick={() => setShowAll(post?._id)}
              >
                Show More
              </span>
            ))}
        </p>

        {post?.image && (
          <div className='relative'>
            <div className={`grid ${
              post?.image.length > 1
                ? (
                  post?.image.length === 3 ? 'grid-cols-2 grid-rows-2' :
                  post?.image.length > 4 ? 'grid-cols-2' :
                  (post?.image.length % 2 === 0 ? 'grid-cols-2' : '')
                )
                : ''} gap-2`} >

              {post?.image.slice(0, 4).map((img, index) => (
                <div key={index}
                  className={`
                    ${post?.image.length > 4 ? 'relative' : 'flex'}
                    overflow-hidden bg-cover bg-no-repeat
                    ${post?.image.length === 3 && index === 2 ? 'col-span-2' : ''} 
                  `}
                >
                  <img
                    src={img}
                    alt={`post image ${index}`}
                    className={`
                      w-full mt-2 rounded-lg transition duration-300 ease-in-out hover:scale-110 
                      ${post?.image.length > 4 && index > 2 ? 'hidden' : ''}
                      `}
                    style={{ opacity: index === post?.image.slice(0, 4).length - 1 && post?.image.length > 4 ? '0.5' : '1' }}
                    onClick={handleImageClick}
                  />

                  {post?.image.length > 4 && index === post?.image.slice(0, 4).length - 1 && (
                    <div
                      className='relative inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg transition duration-300 ease-in-out hover:scale-110'
                      onClick={() => handleImageClick(post.image)}
                    >
                      <img
                        src={img}
                        alt={`post image ${index}`}
                        className='w-full mt-2 opacity-50 rounded-lg transition duration-300 ease-in-out hover:scale-110'
                      />
                      <span 
                      className={`
                          font-bold text-lg absolute inset-0 flex items-center justify-center ${theme === 'dark' ? 'text-white' : ''}
                        `}>
                        +{post?.image.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}


      </div>

      <div
        className='mt-4 flex justify-between items-center px-3 py-2 text-ascent-2
      text-base border-t border-[#66666645]'
      >
        <p className='flex gap-2 items-center text-base cursor-pointer'>
          {post?.likes?.includes(user?._id) ? (
            <BiSolidLike size={20} color='#065ad8' />
          ) : (
            <BiLike size={20} />
          )}
          {post?.likes?.length}
        </p>


        <p
          className='flex gap-2 items-center text-base cursor-pointer'
          onClick={() => {
            setShowComments(showComments === post._id ? null : post._id);
            getComments(post?._id);
          }}
        >
          <BiComment size={20} />
          {post?.comments?.length}
        </p>

        {/* <p className='flex gap-2 items-center text-base cursor-pointer'>
          <CiShare2 size={20} />
          {post?.share?.length}
        </p> */}
        
        <p className='flex gap-2 items-center text-base cursor-pointer'>
          {post?.report?.length > 0 ? (
            <MdOutlineReportProblem size={20} color='red' />
          ) : (
            <MdOutlineReportProblem size={20} />
          )}
          {post?.report?.length}
        </p>

        {/* {user?._id === post?.userId?._id && (
          <div
            className='flex gap-1 items-center text-base text-ascent-1 cursor-pointer'
            onClick={() => deletePost(post?._id)}
          >
            <MdOutlineDeleteOutline size={20} />
            <span>Delete</span>
          </div>
        )} */}
      </div>

      {/* COMMENTS */}
      {showComments === post?._id && (
        <div className='w-full mt-4 border-t border-[#66666645] pt-4 '>
          <CommentForm
            user={user}
            id={post?._id}
            getComments={() => getComments(post?._id)}
          />

          {loading ? (
            <Loading />
          ) : comments?.length > 0 ? (
            comments?.map((comment) => (
              <div className='w-full py-2' key={comment?._id}>
                <div className='flex gap-3 items-center mb-1'>
                  <Link to={"/profile/" + comment?.userId?._id}>
                    <img
                      src={comment?.userId?.profileUrl ?? NoProfile}
                      alt={comment?.userId?.firstName}
                      className='w-10 h-10 rounded-full object-cover'
                    />
                  </Link>
                  <div>
                    <Link to={"/profile/" + comment?.userId?._id}>
                      <p className='font-medium text-base text-ascent-1'>
                        {comment?.userId?.firstName} {comment?.userId?.lastName}
                      </p>
                    </Link>
                    <span className='text-ascent-2 text-sm'>
                      {moment(comment?.createdAt ?? "2023-05-25").fromNow()}
                    </span>
                  </div>
                </div>

                <div className='ml-12'>
                  <p className='text-ascent-2'>{comment?.comment}</p>

                  <div className='mt-2 flex gap-6'>
                    <p className='flex gap-2 items-center text-base text-ascent-2 cursor-pointer'>
                      {comment?.likes?.includes(user?._id) ? (
                        <BiSolidLike size={20} color='blue' />
                      ) : (
                        <BiLike size={20} />
                      )}
                      {comment?.likes?.length}
                    </p>
                    <span
                      className='text-blue cursor-pointer'
                      onClick={() => setReplyComments(comment?._id)}
                    >
                      Phản hồi
                    </span>
                  </div>

                  {replyComments === comment?._id && (
                    <CommentForm
                      user={user}
                      id={comment?._id}
                      replyAt={comment?.from}
                      getComments={() => getComments(post?._id)}
                    />
                  )}
                </div>

                {/* REPLIES */}

                <div className='py-2 px-8 mt-6'>
                  {comment?.replies?.length > 0 && (
                    <p
                      className='text-base text-ascent-1 cursor-pointer'
                      onClick={() =>
                        setShowReply(
                          showReply === comment?.replies?._id
                            ? 0
                            : comment?.replies?._id
                        )
                      }
                    >
                      Hiện thêm ({comment?.replies?.length})
                    </p>
                  )}

                  {showReply === comment?.replies?._id &&
                    comment?.replies?.map((reply) => (
                      <ReplyCard
                        reply={reply}
                        user={user}
                        key={reply?._id}
                        handleLike={() =>
                          handleLike(
                            "/posts/like-comment/" +
                              comment?._id +
                              "/" +
                              reply?._id
                          )
                        }
                      />
                    ))}
                </div>
              </div>
            ))
          ) : (
            <span className='flex text-sm py-4 text-ascent-2 text-center'>
              No Comments, be first to comment
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
