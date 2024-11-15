import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosConfig";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { NoProfile } from "../assets";
import { BiComment, BiLike, BiSolidLike, BiTrash } from "react-icons/bi";
import { CiShare2, CiMenuKebab } from "react-icons/ci";
import { MdOutlineReportProblem, MdGroups } from "react-icons/md";
import { FaShare, FaFile } from "react-icons/fa";
import { useForm } from "react-hook-form";
import CustomButton from "./CustomButton";
import { useDispatch, useSelector } from "react-redux";
import { ImageDetail } from ".";
import { savePost, sharePost, updatePost } from "../redux/postSlice";
import TextInput from "./TextInput";
import Loading from "./Loading";
import Modal from "react-modal";
import moment from "moment";
import Swal from "sweetalert2";
import socket from '../api/socket';
import { formatDate } from './../utils/formatDate';
import { toast } from 'react-toastify';

const ReplyCard = ({ reply, user, handleLike, handleDelete }) => {
  const [isLiked, setIsLiked] = useState(reply.likedBy.includes(user?._id));
  const [likes, setLikes] = useState(reply.likes);

  return (
    <div className="w-full py-3">
      <div className="flex items-center gap-3 mb-1">
        <Link to={"/profile/" + reply?.user?._id}>
          <img
            src={reply?.user?.avatar ?? NoProfile}
            alt={reply?.user?.firstName}
            className="object-cover w-10 h-10 rounded-full"
          />
        </Link>

        <div>
          <Link to={"/profile/" + reply?.user?._id}>
            <p className="text-base font-medium text-ascent-1">
              {reply?.user?.firstName} {reply?.user?.lastName}
            </p>
          </Link>
          <span className="text-sm text-ascent-2">
            {moment(reply?.created_At).fromNow()}
          </span>
        </div>
        {user._id === reply.user._id && (
          <button onClick={handleDelete}>
            <BiTrash size={20} color="red" />
          </button>
        )}
      </div>

      <div className="ml-12">
        <p className="text-ascent-2 ">{reply?.content}</p>
        <div className="flex gap-6 mt-2">
          <p
            className="flex items-center gap-2 text-base cursor-pointer text-ascent-2"
            onClick={() => {
              handleLike();
              setIsLiked(!isLiked);
              setLikes(isLiked ? likes - 1 : likes + 1);
            }}
          >
            {isLiked ? (
              <BiSolidLike size={20} color="blue" />
            ) : (
              <BiLike size={20} />
            )}
            {likes}
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

  const dispatch = useDispatch();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const endpoint = replyAt
        ? `/posts/reply-comment/${id}`
        : `/posts/comment/${id}`;

      const payload = {
        content: data.comment,
        from: user?._id,
      };

      if (replyAt) {
        payload.replyAt = replyAt;
      }

      const res = await axiosInstance.post(endpoint, payload);
      if (res.status === 201) {
        reset();
        getComments();
        if (res.data.post) {
          const post = res.data.post;
          dispatch(updatePost(post));

          const notiRes = await axiosInstance.post('/users/create-notification', {
            receiverIds: [post.user._id],
            sender: user?._id,
            message: `${user?.firstName} ${user?.lastName} đã bình luận bài viết của bạn`,
            type: 'comment',
            link: `/posts/${post._id}`,
          });

          if (notiRes.status === 201) {
            console.log('send notification to:', post.user._id);
            socket.emit('sendNotification', { receiverId: post.user._id, notification: notiRes.data.notification });
          }
        }
      }
    } catch (error) {
      setErrMsg({
        status: "failed",
        message: error.response.data.message,
      });
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full border-b border-[#66666645]"
    >
      <div className="flex items-center w-full gap-2 py-4">
        <img
          src={user?.avatar ?? NoProfile}
          alt="User Image"
          className="object-cover w-10 h-10 rounded-full"
        />

        <TextInput
          name="comment"
          styles="w-full rounded-full py-3"
          placeholder={replyAt ? `Reply @${replyAt}` : "Bình luận bài đăng"}
          register={register("comment", {
            required: "Bình luận không được để trống",
          })}
          error={errors.comment ? errors.comment.message : ""}
        />
      </div>
      {errMsg?.message && (
        <span
          role="alert"
          className={`text-sm ${errMsg?.status === "failed"
            ? "text-[#f64949fe]"
            : "text-[#2ba150fe]"
            } mt-0.5`}
        >
          {errMsg?.message}
        </span>
      )}

      <div className="flex items-end justify-end pb-2">
        {loading ? (
          <Loading />
        ) : (
          <CustomButton
            title="Bình luận"
            type="submit"
            containerStyles="bg-[#0444a4] text-white py-1 px-3 rounded-full font-semibold text-sm hover:bg-sky"
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
  const isSaved = post?.savedBy?.includes(user?._id);
  const friendIds = user?.friends.map((friend) => friend._id);
  const dispatch = useDispatch();

  const openReportModal = () => setIsModalOpen(true);
  const closeReportModal = () => setIsModalOpen(false);

  const handleReport = () => {
    reportPost(post);
    closeReportModal();
  };

  const getComments = async (postId) => {
    try {
      setLoading(true);
      const postComments = await axiosInstance
        .get(`/posts/comments/${postId}`)
        .then((res) => res.data.comments);
      setReplyComments(0);
      setComments(postComments);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const response = await axiosInstance.post(
        `/posts/like-comment/${commentId}`
      );
      const updatedComment = response.data.comment;
      const updatedComments = comments.map((comment) =>
        comment._id === updatedComment._id ? updatedComment : comment
      );
      setComments(updatedComments);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLikeReplyComment = async (commentId, replyId) => {
    try {
      const response = await axiosInstance.post(
        `/posts/like-comment/${commentId}/${replyId}`
      );
      const updatedComment = response.data.rComment;
      const updatedComments = comments.map((comment) => {
        if (comment._id === updatedComment._id) {
          return updatedComment;
        }
        return comment;
      });
      setComments(updatedComments);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const confirmDelete = await Swal.fire({
        title: "Bạn có chắc muốn xóa bình luận này?",
        text: "Bình luận sẽ bị xóa vĩnh viễn",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      });

      if (confirmDelete.isConfirmed) {
        await axiosInstance.delete(`/posts/comment/${commentId}`);
        getComments(post._id);
        const updatedComments = comments.filter(
          (comment) => comment._id !== commentId
        );
        const updatedPost = { ...post, comments: updatedComments };
        dispatch(updatePost(updatedPost));
        Swal.fire(
          "Xóa thành công",
          "Bạn đã xóa bình luận thành công!",
          "success"
        );
      }
    } catch (error) {
      console.log(error);
      Swal.fire("Xóa thất bại", "Có lỗi xảy ra, vui lòng thử lại", "error");
    }
  };

  const handleDeleteReplyComment = async (commentId, replyId) => {
    try {
      const confirmDelete = await Swal.fire({
        title: "Bạn có chắc muốn xóa phản hồi của bình luận này?",
        text: "Phản hồi sẽ bị xóa vĩnh viễn",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      });

      if (confirmDelete.isConfirmed) {
        await axiosInstance.delete(`/posts/comment/${commentId}/${replyId}`);
        getComments(post._id);
        const updatedComments = comments.map((comment) => {
          if (comment._id === commentId) {
            const updatedReplies = comment.replies.filter(
              (reply) => reply._id !== replyId
            );
            return { ...comment, replies: updatedReplies };
          }
          return comment;
        });
        const updatedPost = { ...post, comments: updatedComments };
        dispatch(updatePost(updatedPost));
        Swal.fire(
          "Xóa thành công",
          "Bạn đã xóa phản hồi thành công!",
          "success"
        );
      }
    } catch (error) {
      console.log(error);
      Swal.fire("Xóa thất bại", "Có lỗi xảy ra, vui lòng thử lại", "error");
    }
  };

  const handleSavePost = async () => {
    await dispatch(savePost(post._id));
    const updatedPost = {
      ...post,
      savedBy: isSaved
        ? post.savedBy.filter((id) => id !== user?._id)
        : [...post.savedBy, user?._id],
    };
    dispatch(updatePost(updatedPost));
  };

  const handleSharePost = async (postId) => {
    try {
      const hasShared = post.sharedBy.some((share) => share._id === user._id);
      await dispatch(sharePost(postId));
      const updatedPost = {
        ...post,
        shares: !hasShared ? post.shares + 1 : post.shares - 1,
        sharedBy: !hasShared ? [...post.sharedBy, user] : post.sharedBy.filter((share) => share._id !== user._id),
      };
      dispatch(updatePost(updatedPost));
      toast.success(`${hasShared ? 'Bỏ chia' : 'Chia'} sẻ bài viết thành công`);
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }

  }

  const navigate = useNavigate();
  const location = useLocation();

  const handleImageClick = () => {
    setShowImageModal(true);
  };
  const [showImageModal, setShowImageModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editPostData, setEditPostData] = useState({
    content: post?.content || "",
    images: post?.images || [],
    privacy: post?.privacy || "public",
  });

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditPostData({ ...editPostData, [name]: value });
  };

  const handleEditImageChange = (e) => {
    const newImages = Array.from(e.target.files);
    setEditPostData({
      ...editPostData,
      images: [...editPostData.images, ...newImages],
    });
  };

  const handleSaveEdit = async () => {

    const remainingImages = editPostData.images.filter(image => typeof image === "string");
    const newImages = editPostData.images.filter(image => typeof image !== "string");


    const formData = new FormData();
    formData.append("userId", user._id);
    formData.append("content", editPostData.content);
    formData.append("privacy", editPostData.privacy);

    // Gửi danh sách hình ảnh và tệp tin còn giữ lại
    remainingImages.forEach(image => formData.append("remainingImages[]", image));

    // Thêm các hình ảnh và tệp tin mới nếu có
    newImages.forEach(image => formData.append("images", image));

    try {
      const res = await axiosInstance.put(`/posts/${post._id}`, formData);

      dispatch(updatePost(res.data.post));
      handleCloseEdit();
      toast.success("Cập nhật bài viết thành công");
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
      console.error("Lỗi khi gọi API cập nhật:", error);
    }
  };

  const handleOpenEdit = () => {
    setShowMenu(false);
    setEditPostData({
      content: post?.content || "",
      images: post?.images || [],
      privacy: post?.privacy || "public"
    });
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setEditPostData({
      content: post?.content || "",
      images: post?.images || [],
      privacy: post?.privacy || "public"
    });
    setIsEditing(false);
  };

  return (
    <div className="p-4 mb-2 bg-primary rounded-xl">
      {post?.sharedBy.length > 0 &&
        user?._id !== post?.user?._id &&
        post?.sharedBy.some(user => friendIds.includes(user._id)) &&
        (
          <div className="mb-4 border-b border-[#66666645]">
            {post?.sharedBy
              .filter(user => friendIds.includes(user._id))
              .map(user => (
                <Link
                  key={user._id}
                  to={`/profile/${user._id}`}
                  className="flex items-center mb-2"
                >
                  <img
                    src={user.avatar ?? NoProfile}
                    alt={user.firstName}
                    className="object-cover w-8 h-8 mr-2 rounded-full"
                  />
                  <span className="text-ascent-1">
                    <span className="text-sky">
                      {user.lastName} {user.firstName}
                    </span> đã chia sẻ
                  </span>
                </Link>
              ))}
          </div>
        )}
      {showImageModal && (
        <ImageDetail
          images={post.images}
          onClose={() => setShowImageModal(false)}
        />
      )}
      <div
        className={`${post?.sharedBy.length > 0 && user?._id !== post?.user?._id ? "mx-3 my-3 border border-[#66666645] pl-4 pr-2" : ""
          }`}
      >
        {post?.group?._id && (
          <div className="mb-4">
            <Link to={`/group/${post?.group?._id}`} className="flex items-center">
              <MdGroups size={30} className="text-ascent-1" />
              <span className="ml-2 text-ascent-1">{post?.group?.name}</span>
            </Link>
          </div>
        )}
        <div className="flex items-center gap-3 mb-2">
          <Link to={"/profile/" + post?.user?._id}>
            <img
              src={post?.user?.avatar ?? NoProfile}
              alt={post?.user?.firstName}
              className="object-cover w-16 rounded-full h-13"
            />
          </Link>

          <div className="flex justify-between w-full">
            <div className="">
              <Link to={"/profile/" + post?.user?._id}>
                <p className="text-lg font-medium text-ascent-1">
                  {post?.user?.lastName} {post?.user?.firstName}
                </p>
              </Link>
              <span className="text-ascent-2">
                {(post?.user?.privacy === 'public') ? (
                  <>
                    {post?.user?.faculty?.name} - {post?.user?.major?.majorName} {post?.user?.academicYear}
                  </>
                ) : (
                  <>
                  </>
                )}
              </span>
            </div>
            <span className="flex gap-4 item-centers text-ascent-2">
              {formatDate(post?.createdAt)}
              <div className="relative">
                <CiMenuKebab
                  className="h-full text-lg cursor-pointer text-ascent-1"
                  onClick={() => setShowMenu(!showMenu)}
                />
                {showMenu && (
                  <div className="absolute top-0 z-50 border border-gray-300 rounded-md end-5 bg-primary">
                    <ul className="items-center px-2 py-1 cursor-pointer text-ascent-1">
                      {user?._id === post?.user?._id && (
                        <li className="py-1" onClick={handleOpenEdit}>
                          <span>Chỉnh&nbsp;sửa</span>
                        </li>
                      )}
                      <li
                        className={`${isSaved ? "text-red whitespace-nowrap" : "whitespace-nowrap"} py-1`}
                        onClick={handleSavePost}
                      >
                        <span>
                          {isSaved ? "Bỏ lưu" : "Lưu"}
                        </span>
                      </li>
                      {user?._id === post?.user?._id && (
                        <li
                          className="py-1"
                          onClick={() => deletePost(post._id)}
                        >
                          Xóa
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </span>
          </div>
        </div>
        <div>
          <p className="text-ascent-2">
            {showAll === post?._id ? post?.content : post?.content?.slice(0, 300)}

            {post?.content?.length > 301 &&
              (showAll === post?._id ? (
                <span
                  className="ml-2 font-medium cursor-pointer text-blue"
                  onClick={() => setShowAll(0)}
                >
                  Rút gọn
                </span>
              ) : (
                <span
                  className="ml-2 font-medium cursor-pointer text-blue"
                  onClick={() => setShowAll(post?._id)}
                >
                  Xem thêm
                </span>
              ))}
          </p>

          {post?.images && (
            <div className="relative">
              <div
                className={`grid ${post?.images.length > 1
                  ? post?.images.length === 3
                    ? "grid-cols-2 grid-rows-2"
                    : post?.images.length > 4
                      ? "grid-cols-2"
                      : post?.images.length % 2 === 0
                        ? "grid-cols-2"
                        : ""
                  : ""
                  } gap-2`}
              >
                {post?.images.slice(0, 4).map((img, index) => (
                  <div
                    key={index}
                    className={`
                    ${post?.images.length > 4 ? "relative" : "flex"}
                    overflow-hidden bg-cover bg-no-repeat
                    ${post?.images.length === 3 && index === 2
                        ? "col-span-2"
                        : ""
                      } 
                  `}
                  >
                    <img
                      src={img}
                      alt={`post image ${index}`}
                      className={`
                      w-full mt-2 rounded-lg transition duration-300 ease-in-out hover:scale-110 
                      ${post?.images.length > 4 && index > 2 ? "hidden" : ""}
                      `}
                      style={{
                        opacity:
                          index === post?.images.slice(0, 4).length - 1 &&
                            post?.images.length > 4
                            ? "0.5"
                            : "1",
                      }}
                      onClick={handleImageClick}
                    />

                    {post?.images.length > 4 &&
                      index === post?.images.slice(0, 4).length - 1 && (
                        <div
                          className="relative inset-0 flex items-center justify-center transition duration-300 ease-in-out bg-black bg-opacity-50 rounded-lg hover:scale-110"
                          onClick={() => handleImageClick(post.images)}
                        >
                          <img
                            src={img}
                            alt={`post image ${index}`}
                            className="w-full mt-2 transition duration-300 ease-in-out rounded-lg opacity-50 hover:scale-110"
                          />
                          <span
                            className={`
                          font-bold text-lg absolute inset-0 flex items-center justify-center ${theme === "dark" ? "text-white" : ""
                              }
                        `}
                          >
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
      </div>

      <div
        className="mt-4 flex justify-between items-center px-3 py-2 text-ascent-2
      text-base border-t border-[#66666645]"
      >
        <p
          className="flex items-center gap-2 text-base cursor-pointer"
          onClick={() => likePost(post)}
        >
          {post?.likedBy?.includes(user?._id) ? (
            <BiSolidLike size={20} color="#065ad8" />
          ) : (
            <BiLike size={20} />
          )}
          {post?.likes}
        </p>

        <p
          className="flex items-center gap-2 text-base cursor-pointer"
          onClick={() => {
            setShowComments(showComments === post._id ? null : post._id);
            getComments(post?._id);
          }}
        >
          <BiComment size={20} />
          {post?.comments?.length}
        </p>

        {!location.pathname.startsWith('/group') && (
          <p className="flex items-center gap-2 text-base cursor-pointer">
            <span onClick={() => handleSharePost(post._id)}>
              {post?.sharedBy?.some((share) => share._id === user._id) ? (
                <FaShare size={20} color="#065ad8" />
              ) : (
                <FaShare size={20} />
              )}
            </span>
            {post?.shares}
          </p>
        )}

        <p
          className="flex items-center gap-2 text-base cursor-pointer"
          onClick={openReportModal}
        >
          {post?.reportedBy?.includes(user?._id) ? (
            <MdOutlineReportProblem size={20} color="red" />
          ) : (
            <MdOutlineReportProblem size={20} />
          )}
          {post?.reports}
        </p>
      </div>

      {/* Report modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeReportModal}
        contentLabel="Report Post Confirmation"
        className={{
          base: `modal-base ${theme === "dark" ? "modal-dark" : "modal-light"}`,
          afterOpen: "modal-after-open",
          beforeClose: "modal-before-close",
        }}
        overlayClassName="modal-overlay"
        ariaHideApp={false}
      >
        <div
          className={`p-4 ${theme === "dark" ? "bg-dark text-white" : "bg-white text-black"
            } rounded-lg`}
        >
          <h2 className="mb-4 text-lg font-semibold">Báo cáo bài viết</h2>
          <p>
            {!hasReported
              ? "Bạn có chắc muốn báo cáo bài viết này?"
              : "Bạn có chắc muốn gỡ báo cáo bài viết này?"}
          </p>
          <div className="flex justify-end gap-4 mt-4">
            <button
              onClick={closeReportModal}
              className={`px-4 py-2 ${theme === "dark" ? "text-white" : "text-ascent"
                } bg-gray-200 rounded-md hover:bg-blue`}
            >
              Thoát
            </button>
            <button
              onClick={handleReport}
              className={`px-4 py-2 ${theme === "dark" ? "text-white" : "text-ascent"
                } bg-gray-200 rounded-md ${!hasReported ? "hover:bg-red" : "hover:bg-gray"
                }`}
            >
              Xác nhận
            </button>
          </div>
        </div>
      </Modal>

      {/* COMMENTS */}
      {showComments === post?._id && (
        <div className="w-full mt-4 border-t border-[#66666645] pt-4 ">
          <CommentForm
            user={user}
            id={post?._id}
            getComments={() => getComments(post?._id)}
          />

          {loading ? (
            <Loading />
          ) : comments?.length > 0 ? (
            comments?.map((comment) => (
              <div className="w-full py-2" key={comment?._id}>
                <div className="flex items-center gap-3 mb-1">
                  <Link to={"/profile/" + comment?.user?._id}>
                    <img
                      src={comment?.user?.avatar ?? NoProfile}
                      alt={comment?.user?.firstName}
                      className="object-cover w-10 h-10 rounded-full"
                    />
                  </Link>
                  <div>
                    <Link to={"/profile/" + comment?.user?._id}>
                      <p className="text-base font-medium text-ascent-1">
                        {comment?.user?.firstName} {comment?.user?.lastName}
                      </p>
                    </Link>
                    <span className="text-sm text-ascent-2">
                      {moment(comment?.createdAt ?? "2024-08-13").fromNow()}
                    </span>
                  </div>
                  {user._id === comment.user._id && (
                    <button onClick={() => handleDeleteComment(comment._id)}>
                      <BiTrash size={20} color="red" />
                    </button>
                  )}
                </div>
                <div className="ml-12">
                  <p className="text-ascent-2">{comment?.content}</p>

                  <div className="flex gap-6 mt-2">
                    <p className="flex items-center gap-2 text-base cursor-pointer text-ascent-2">
                      {comment?.likedBy?.includes(user?._id) ? (
                        <BiSolidLike
                          size={20}
                          color="blue"
                          onClick={() => handleLikeComment(comment._id)}
                        />
                      ) : (
                        <BiLike
                          size={20}
                          onClick={() => handleLikeComment(comment._id)}
                        />
                      )}
                      {comment?.likes}
                    </p>
                    <span
                      className="cursor-pointer text-blue"
                      onClick={() => setReplyComments(comment?._id)}
                    >
                      Phản hồi
                    </span>
                  </div>

                  {replyComments === comment?._id && (
                    <CommentForm
                      user={user}
                      id={comment?._id}
                      replyAt={comment?.user?.firstName}
                      getComments={() => getComments(post?._id)}
                    />
                  )}
                </div>

                {/* REPLIES */}

                <div className="px-8 py-2 mt-6">
                  {comment?.replies?.length > 0 && (
                    <p
                      className="text-base cursor-pointer text-ascent-1"
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
                          handleLikeReplyComment(comment._id, reply._id)
                        }
                        handleDelete={() =>
                          handleDeleteReplyComment(comment._id, reply._id)
                        }
                      />
                    ))}
                </div>
              </div>
            ))
          ) : (
            <span className='flex py-4 text-sm text-center text-ascent-2'>
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận
            </span>
          )}
        </div>
      )}

      <Modal
        isOpen={isEditing}
        onRequestClose={handleCloseEdit}
        contentLabel="Edit Post"
        className="modal-content max-w-[29rem] mx-auto"
        overlayClassName="modal-overlay"
      >
        <div className="w-full h-full p-2 bg-primary">
          <textarea
            name="content"
            value={editPostData.content}
            onChange={handleEditChange}
            className="w-full p-2 border rounded-md min-h-24"
          />

          <label>
            <select
              id="privacy"
              name="privacy"
              value={editPostData.privacy}
              onChange={handleEditChange}
              className={`bg-secondary border-[#66666690] mb-2 outline-none text-sm text-ascent-2 placeholder:text-[#666] w-full border rounded-md py-2 px-3 mt-1`}
            >
              <option value="private">Cá nhân</option>
              <option value="public">Công khai</option>
            </select>
          </label>

          <div className="mt-2">
            {editPostData.images.map((image, index) => (
              <div key={index} className="relative inline-block mb-2 mr-2">
                <img
                  src={
                    typeof image === "string"
                      ? image
                      : URL.createObjectURL(image)
                  }
                  alt={`Image ${index}`}
                  className="object-cover w-20 h-20 rounded-md"
                />
                <button
                  className="absolute top-0 right-0 p-1 text-white rounded-full bg-red"
                  onClick={() => {
                    setEditPostData({
                      ...editPostData,
                      images: editPostData.images.filter((_, i) => i !== index),
                    });
                  }}
                >
                  X
                </button>
              </div>
            ))}
          </div>

          <input
            type="file"
            multiple
            name="images"
            onChange={handleEditImageChange}
            className="mt-2"
          />

          <div className="flex justify-between mt-2">
            <button
              onClick={handleCloseEdit}
              className="p-2 text-white rounded-md bg-red hover:bg-primary hover:text-red"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveEdit}
              className="p-2 mr-2 text-white rounded-md bg-blue hover:bg-primary hover:text-blue"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PostCard;
