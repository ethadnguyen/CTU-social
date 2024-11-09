import { React, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MdClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import TextInput from "./TextInput";
import Loading from "./Loading";
import CustomButton from "./CustomButton";
import { UpdateProfile, updateUser } from "../redux/userSlice";
import { NoProfile } from "../assets";
import axiosInstance from "../api/axiosConfig";
import { faculties } from "../assets/register";

const EditProfile = () => {
  const { theme } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [picture, setPicture] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || NoProfile);
  const [selectedMajor, setSelectedMajor] = useState(user?.major || "");
  const [isProfileHidden, setIsProfileHidden] = useState(
    user?.isProfileHidden || false
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: { ...user },
  });

  const onSubmit = async (data) => {
    // In ra thông tin người dùng khi submit
    console.log("Thông tin người dùng:", {
      ...data,
      gender: selectedGender,
      facebook: data.facebook,
      linkedin: data.linkedin,
      github: data.github,
      faculty: selectedFacultyId,
      major: selectedMajor,
      isProfileHidden: isProfileHidden,
    });
    setIsSubmitting(true);
    setErrMsg("");

    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("bio", data.bio);
      formData.append("gender", selectedGender);
      formData.append("facebook", data.facebook); // Thêm URL Facebook
      formData.append("linkedin", data.linkedin); // Thêm URL LinkedIn
      formData.append("github", data.github); // Thêm URL Github
      formData.append("faculty", selectedFaculty); // Thêm khoa
      formData.append("major", selectedMajor); // Thêm ngành
      formData.append("isProfileHidden", isProfileHidden); // Thêm trạng thái ẩn hồ sơ

      if (picture) {
        formData.append("avatar", picture);
      }

      const res = await axiosInstance.put(`/users/${user._id}`, formData);

      if (res.data.status === "SUCCESS") {
        dispatch(UpdateProfile(false));
        dispatch(updateUser(res.data.user));
        setIsSubmitting(false);
      } else {
        setErrMsg({ message: res.error.data.message, status: "failed" });
        setIsSubmitting(false);
      }
    } catch (error) {
      setErrMsg({
        message: "Đã xảy ra lỗi, vui lòng thử lại!",
        status: "failed",
      });
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    dispatch(UpdateProfile(false));
  };

  const handleSelect = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      file.size <= 2 * 1024 * 1024 &&
      (file.type === "image/jpeg" || file.type === "image/png")
    ) {
      setPicture(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setErrMsg({ message: "Ảnh không hợp lệ!", status: "failed" });
    }
  };

  const [selectedGender, setSelectedGender] = useState(user?.gender || "");
  const handleGenderChange = (event) => {
    setSelectedGender(event.target.value);
  };

  const handleProfileHiddenChange = (event) => {
    setIsProfileHidden(event.target.checked);
  };

  const [selectedFacultyId, setSelectedFacultyId] = useState(
    user?.facultyId || ""
  );
  const [selectedMajorId, setSelectedMajorId] = useState(user?.majorId || "");
  const [availableMajors, setAvailableMajors] = useState([]);

  useEffect(() => {
    console.log("faculty: ",selectedFacultyId);
    console.log("major: ",selectedMajorId);
    const selectedFaculty = faculties.find(
      (faculty) => faculty.id === selectedFacultyId
    );
    
    if (selectedFaculty) {
      setAvailableMajors(selectedFaculty.majors);
      console.log("Major",availableMajors)
    } else {
      setAvailableMajors([]);
    }
  }, [user, selectedFacultyId]);

  // Xử lý khi chọn khoa
  const handleFacultyChange = (event) => {
    setSelectedFacultyId(parseInt(event.target.value, 10));
    setSelectedMajorId(""); // Reset ngành đã chọn khi chọn khoa mới
  };

  // Xử lý khi chọn ngành
  const handleMajorChange = (event) => {
    setSelectedMajorId(parseInt(event.target.value, 10));
  };

  return (
    <>
      <div className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity">
            <div className="absolute inset-0 bg-[#000] opacity-70"></div>
          </div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
          &#8203;
          <div
            className="inline-block align-bottom bg-primary rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-headline"
          >
            <div className="flex justify-between px-6 pt-5 pb-2">
              <label
                htmlFor="name"
                className="block font-medium text-xl text-ascent-1 text-left"
              >
                Chỉnh sửa thông tin cá nhân
              </label>

              <button className="text-ascent-1" onClick={handleClose}>
                <MdClose size={22} />
              </button>
            </div>
            <form
              className="px-4 sm:px-6 flex flex-col gap-3 2xl:gap-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <label
                htmlFor="imgUploadProfile"
                className={`
                  cursor-pointer my-4
                `}
              >
                <input
                  type="file"
                  name="avatar"
                  className="hidden"
                  id="imgUploadProfile"
                  onChange={(e) => handleSelect(e)}
                  accept=".jpg, .png, .jpeg"
                />

                <img
                  src={preview}
                  alt="user profile"
                  className={`
                    ${window.innerWidth < 768 ? "w-[40%]" : "w-[35%]"}
                    rounded-full object-cover mx-auto transition duration-300 ease-in-out hover:scale-110
                  `}
                />
              </label>

              <TextInput
                name="firstName"
                label={<span className="font-bold">Tên</span>}
                placeholder="Tên"
                type="text"
                styles="w-full"
                register={register("firstName", {
                  required: "Tên là bắt buộc!",
                })}
                error={errors.firstName ? errors.firstName?.message : ""}
              />

              <TextInput
                label={<span className="font-bold">Họ</span>}
                name="lastName"
                placeholder="Họ"
                type="lastName"
                styles="w-full"
                register={register("lastName", {
                  required: "Họ không khớp!",
                })}
                error={errors.lastName ? errors.lastName?.message : ""}
              />

              <TextInput
                name="bio"
                label={<span className="font-bold">Bio</span>}
                placeholder="Bio"
                type="text"
                styles="w-full"
                register={register("bio")}
                error={errors.bio ? errors.bio?.message : ""}
                defaultValue={user?.bio || ""}
              />

              <label>
                <span
                  className={`font-bold text-ascent-2 text-sm mb-2 ${
                    theme === "dark" ? "text-gray" : "text-black"
                  }`}
                >
                  Giới tính
                </span>
                <select
                  id="gender"
                  value={selectedGender}
                  onChange={handleGenderChange}
                  className={`bg-secondary border-[#66666690] mb-2 outline-none text-sm text-ascent-2 placeholder:text-[#666] w-full border rounded-md py-2 px-3 mt-1`}
                >
                  <option
                    value=""
                    className={`text-ascent-2 text-sm mb-2 ${
                      theme === "dark" ? "text-white" : "text-black"
                    }`}
                  >
                    Chọn giới tính
                  </option>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
              </label>

              <TextInput
                name="facebook"
                label={<span className="font-bold">Facebook</span>}
                placeholder="URL Facebook"
                type="text"
                styles="w-full"
                register={register("facebook")}
                error={errors.facebook ? errors.facebook?.message : ""}
              />

              <TextInput
                name="linkedin"
                label={<span className="font-bold">LinkedIn</span>}
                placeholder="URL LinkedIn"
                type="text"
                styles="w-full"
                register={register("linkedin")}
                error={errors.linkedin ? errors.linkedin?.message : ""}
              />

              <TextInput
                name="github"
                label={<span className="font-bold">Github</span>}
                placeholder="URL Github"
                type="text"
                styles="w-full"
                register={register("github")}
                error={errors.github ? errors.github?.message : ""}
              />

              <label>
                <span
                  className={`font-bold text-ascent-2 text-sm mb-2 ${
                    theme === "dark" ? "text-gray" : "text-black"
                  }`}
                >
                  Khoa
                </span>
                <select
                  id="faculty"
                  value={selectedFacultyId}
                  onChange={handleFacultyChange}
                  className={`bg-secondary border-[#66666690] mb-2 outline-none text-sm text-ascent-2 placeholder:text-[#666] w-full border rounded-md py-2 px-3 mt-1`}
                >
                  <option value="">Chọn khoa</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span
                  className={`font-bold text-ascent-2 text-sm mb-2 ${
                    theme === "dark" ? "text-gray" : "text-black"
                  }`}
                >
                  Ngành
                </span>
                <select
                  id="major"
                  value={selectedMajorId}
                  onChange={handleMajorChange}
                  className={`bg-secondary border-[#66666690] mb-2 outline-none text-sm text-ascent-2 placeholder:text-[#666] w-full border rounded-md py-2 px-3 mt-1`}
                  disabled={!selectedFacultyId}
                >
                  <option value="">Chọn ngành</option>
                  {availableMajors.map((major) => (
                    <option key={major.id} value={major.id}>
                      {major.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-center">
                <input
                  id="hideProfile"
                  type="checkbox"
                  checked={isProfileHidden}
                  onChange={handleProfileHiddenChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="hideProfile"
                  className={`ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 ${
                    theme === "dark" ? "text-gray" : "text-black"
                  }`}
                >
                  Ẩn hồ sơ
                </label>
              </div>

              {errMsg?.message && (
                <span
                  role="alert"
                  className={`text-sm ${
                    errMsg?.status === "failed"
                      ? "text-[#f64949fe]"
                      : "text-[#2ba150fe]"
                  } mt-0.5`}
                >
                  {errMsg?.message}
                </span>
              )}

              <div className="py-5 sm:flex sm:flex-row-reverse border-t border-[#66666645]">
                {isSubmitting ? (
                  <Loading />
                ) : (
                  <CustomButton
                    type="submit"
                    containerStyles={`inline-flex justify-center rounded-md bg-blue px-8 py-3 text-sm font-medium text-white outline-none`}
                    title="Lưu"
                  />
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
