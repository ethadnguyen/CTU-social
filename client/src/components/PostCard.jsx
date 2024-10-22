import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import moment from "moment";
import { NoProfile } from "../assets";
import { BiComment, BiLike, BiSolidLike } from "react-icons/bi";
import { CiShare2, CiMenuKebab } from "react-icons/ci";
import { MdOutlineReportProblem, MdGroups } from "react-icons/md";
import { useForm } from "react-hook-form";
import TextInput from "./TextInput";
import Loading from "./Loading";
import CustomButton from "./CustomButton";
import { postComments } from "../assets/home";
import { useSelector } from "react-redux";
import { ImageDetail } from ".";
import Modal from "react-modal";

const ReplyCard = ({ reply, user, handleLike }) => {
  return (
    <div className='w-full py-3'>
      <div className='flex items-center gap-3 mb-1'>
        <Link to={"/profile/" + reply?.user?._id}>
          <img
            src={reply?.user?.avatar ?? NoProfile}
            alt={reply?.user?.firstName}
            className='object-cover w-10 h-10 rounded-full'
          />
        </Link>

        <div>
          <Link to={"/profile/" + reply?.user?._id}>
            <p className='text-base font-medium text-ascent-1'>
              {reply?.user?.firstName} {reply?.user?.lastName}
            </p>
          </Link>
          <span className='text-sm text-ascent-2'>
            {moment(reply?.createdAt).fromNow()}
          </span>
        </div>
      </div>

      <div className='ml-12'>
        <p className='text-ascent-2 '>{reply?.comment}</p>
        <div className='flex gap-6 mt-2'>
          <p
            className='flex items-center gap-2 text-base cursor-pointer text-ascent-2'
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

  const onSubmit = async (data) => { };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='w-full border-b border-[#66666645]'
    >
      <div className='flex items-center w-full gap-2 py-4'>
        <img
          src={user?.avatar ?? NoProfile}
          alt='User Image'
          className='object-cover w-10 h-10 rounded-full'
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
          className={`text-sm ${errMsg?.status === "failed"
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

const PostCard = ({ post, user, deletePost, likePost, reportPost }) => {
  const { theme } = useSelector((state) => state.theme);
  const [showAll, setShowAll] = useState(0);
  const [showReply, setShowReply] = useState(0);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyComments, setReplyComments] = useState(0);
  const [showComments, setShowComments] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasReported = post?.reportedBy?.includes(user?._id);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleReport = () => {
    reportPost(post);
    closeModal();
  };

  const getComments = async () => {
    setReplyComments(0);

    setComments(postComments);
    setLoading(false);
  };
  const handleLikeComment = async () => {
    // likePost(post._id);
  };

  const navigate = useNavigate();
  const location = useLocation();

  const handleImageClick = () => {
    setShowImageModal(true);
  };
  const [showImageModal, setShowImageModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className='p-4 mb-2 bg-primary rounded-xl'>
      {showImageModal && (
        <ImageDetail
          images={post.images}
          onClose={() => setShowImageModal(false)}
        />
      )}

      {post?.groupId && (
        <div className="mb-4">
          <Link to={`/groups/${post.groupId}`} className="flex items-center">
            <MdGroups size={30} className="text-ascent-1" />
            <span className="ml-2 text-ascent-1">{post.groupName}</span>
          </Link>
        </div>
      )}

      <div className='flex items-center gap-3 mb-2'>
        <Link to={"/profile/" + post?.user?._id}>
          <img
            src={post?.user?.avatar ?? NoProfile}
            alt={post?.user?.firstName}
            className='object-cover w-16 rounded-full h-13'
          />
        </Link>

        <div className='flex justify-between w-full'>
          <div className=''>
            <Link to={"/profile/" + post?.user?._id}>
              <p className='text-lg font-medium text-ascent-1'>
                {post?.user?.lastName} {post?.user?.firstName}
              </p>
            </Link>
            <span className='text-ascent-2'>
              {post?.user?.major ? (
                <>{post?.user?.faculty?.name}, {post?.user?.major?.majorName}</>
              ) : (
                <>{post?.user?.faculty?.name || post?.user?.major?.majorName}</>
              )}
            </span>
          </div>

          <span className='flex gap-4 item-centers text-ascent-2'>
            {moment(post?.createdAt ?? "2024-05-25").fromNow()}
            <div className='relative'>
              <CiMenuKebab className='h-full text-lg cursor-pointer text-ascent-1' onClick={() => setShowMenu(!showMenu)} />
              {showMenu && (
                <div className="absolute top-0 z-50 border border-gray-300 rounded-md end-5 bg-primary">
                  <ul className="px-2 py-1 cursor-pointer text-ascent-1 itemscenters">
                    <li className='py-1' onClick={() => { }}>Lưu</li>
                    <li className='py-1' onClick={() => { }}><span>Chia&nbsp;sẻ</span></li>
                    {user?._id === post?.user?._id && (
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
            ? post?.content
            : post?.content?.slice(0, 300)}

          {post?.content?.length > 301 &&
            (showAll === post?._id ? (
              <span
                className='ml-2 font-medium cursor-pointer text-blue'
                onClick={() => setShowAll(0)}
              >
                Rút gọn
              </span>
            ) : (
              <span
                className='ml-2 font-medium cursor-pointer text-blue'
                onClick={() => setShowAll(post?._id)}
              >
                Xem thêm
              </span>
            ))}
        </p>

        {post?.images && (
          <div className='relative'>
            <div className={`grid ${post?.images.length > 1
              ? (
                post?.images.length === 3 ? 'grid-cols-2 grid-rows-2' :
                  post?.images.length > 4 ? 'grid-cols-2' :
                    (post?.images.length % 2 === 0 ? 'grid-cols-2' : '')
              )
              : ''} gap-2`} >

              {post?.images.slice(0, 4).map((img, index) => (
                <div key={index}
                  className={`
                    ${post?.images.length > 4 ? 'relative' : 'flex'}
                    overflow-hidden bg-cover bg-no-repeat
                    ${post?.images.length === 3 && index === 2 ? 'col-span-2' : ''} 
                  `}
                >
                  <img
                    src={img}
                    alt={`post image ${index}`}
                    className={`
                      w-full mt-2 rounded-lg transition duration-300 ease-in-out hover:scale-110 
                      ${post?.images.length > 4 && index > 2 ? 'hidden' : ''}
                      `}
                    style={{ opacity: index === post?.images.slice(0, 4).length - 1 && post?.images.length > 4 ? '0.5' : '1' }}
                    onClick={handleImageClick}
                  />

                  {post?.images.length > 4 && index === post?.images.slice(0, 4).length - 1 && (
                    <div
                      className='relative inset-0 flex items-center justify-center transition duration-300 ease-in-out bg-black bg-opacity-50 rounded-lg hover:scale-110'
                      onClick={() => handleImageClick(post.images)}
                    >
                      <img
                        src={img}
                        alt={`post image ${index}`}
                        className='w-full mt-2 transition duration-300 ease-in-out rounded-lg opacity-50 hover:scale-110'
                      />
                      <span
                        className={`
                          font-bold text-lg absolute inset-0 flex items-center justify-center ${theme === 'dark' ? 'text-white' : ''}
                        `}>
                        +{post?.images.length - 4}
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
        <p className='flex items-center gap-2 text-base cursor-pointer' onClick={() => likePost(post)}>
          {post?.likedBy?.includes(user?._id) ? (
            <BiSolidLike size={20} color='#065ad8' />
          ) : (
            <BiLike size={20} />
          )}
          {post?.likes}
        </p>


        <p
          className='flex items-center gap-2 text-base cursor-pointer'
          onClick={() => {
            setShowComments(showComments === post._id ? null : post._id);
            getComments(post?._id);
          }}
        >
          <BiComment size={20} />
          {post?.comments?.length}
        </p>

        {/* <p className='flex items-center gap-2 text-base cursor-pointer'>
          <CiShare2 size={20} />
          {post?.share?.length}
        </p> */}

        <p className='flex items-center gap-2 text-base cursor-pointer' onClick={openModal}>
          {post?.reportedBy?.includes(user?._id) ? (
            <MdOutlineReportProblem size={20} color='red' />
          ) : (
            <MdOutlineReportProblem size={20} />
          )}
          {post?.reports}
        </p>

        {/* {user?._id === post?.user?._id && (
          <div
            className='flex items-center gap-1 text-base cursor-pointer text-ascent-1'
            onClick={() => deletePost(post?._id)}
          >
            <MdOutlineDeleteOutline size={20} />
            <span>Delete</span>
          </div>
        )} */}
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Report Post Confirmation"
        className={{
          base: `modal-base ${theme === 'dark' ? 'modal-dark' : 'modal-light'}`,
          afterOpen: "modal-after-open",
          beforeClose: "modal-before-close"
        }}
        overlayClassName="modal-overlay"
        ariaHideApp={false}
      >
        <div className={`p-4 ${theme === 'dark' ? 'bg-dark text-white' : 'bg-white text-black'} rounded-lg`}>
          <h2 className="mb-4 text-lg font-semibold">Báo cáo bài viết</h2>
          <p>{!hasReported ? 'Bạn có chắc muốn báo cáo bài viết này?' : 'Bạn có chắc muốn gỡ báo cáo bài viết này?'}</p>
          <div className="flex justify-end gap-4 mt-4">
            <button
              onClick={closeModal}
              className={`px-4 py-2 ${theme === 'dark' ? 'text-white' : 'text-ascent'} bg-gray-200 rounded-md hover:bg-blue`}
            >
              Thoát
            </button>
            <button
              onClick={handleReport}
              className={`px-4 py-2 ${theme === 'dark' ? 'text-white' : 'text-ascent'} bg-gray-200 rounded-md ${!hasReported ? 'hover:bg-red' : 'hover:bg-gray'}`}
            >
              Xác nhận
            </button>
          </div>
        </div>
      </Modal>

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
                <div className='flex items-center gap-3 mb-1'>
                  <Link to={"/profile/" + comment?.user?._id}>
                    <img
                      src={comment?.user?.avatar ?? NoProfile}
                      alt={comment?.user?.firstName}
                      className='object-cover w-10 h-10 rounded-full'
                    />
                  </Link>
                  <div>
                    <Link to={"/profile/" + comment?.user?._id}>
                      <p className='text-base font-medium text-ascent-1'>
                        {comment?.user?.firstName} {comment?.user?.lastName}
                      </p>
                    </Link>
                    <span className='text-sm text-ascent-2'>
                      {moment(comment?.createdAt ?? "2023-05-25").fromNow()}
                    </span>
                  </div>
                </div>

                <div className='ml-12'>
                  <p className='text-ascent-2'>{comment?.comment}</p>

                  <div className='flex gap-6 mt-2'>
                    <p className='flex items-center gap-2 text-base cursor-pointer text-ascent-2'>
                      {comment?.likes?.includes(user?._id) ? (
                        <BiSolidLike size={20} color='blue' />
                      ) : (
                        <BiLike size={20} />
                      )}
                      {comment?.likes?.length}
                    </p>
                    <span
                      className='cursor-pointer text-blue'
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

                <div className='px-8 py-2 mt-6'>
                  {comment?.replies?.length > 0 && (
                    <p
                      className='text-base cursor-pointer text-ascent-1'
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
                          handleLikeComment(
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
            <span className='flex py-4 text-sm text-center text-ascent-2'>
              No Comments, be first to comment
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
