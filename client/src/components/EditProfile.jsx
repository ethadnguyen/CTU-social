import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { MdClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import TextInput from "./TextInput";
import Loading from "./Loading";
import CustomButton from "./CustomButton";
import { UpdateProfile } from "../redux/userSlice";
import { NoProfile } from "../assets";

const EditProfile = () => {
  const { theme } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [picture, setPicture] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: { ...user },
  });

  const onSubmit = async (data) => {};

  const handleClose = () => {
    dispatch(UpdateProfile(false));
  };
  const handleSelect = (e) => {
    setPicture(e.target.files[0]);
  };

  const [selectedGender, setSelectedGender] = useState(user?.gender || "");
  const handleGenderChange = (event) => {
    setSelectedGender(event.target.value);
  };

  return (
    <>
      <div className='fixed z-50 inset-0 overflow-y-auto'>
        <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
          <div className='fixed inset-0 transition-opacity'>
            <div className='absolute inset-0 bg-[#000] opacity-70'></div>
          </div>
          <span className='hidden sm:inline-block sm:align-middle sm:h-screen'></span>
          &#8203;
          <div
            className='inline-block align-bottom bg-primary rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'
            role='dialog'
            aria-modal='true'
            aria-labelledby='modal-headline'
          >
            <div className='flex justify-between px-6 pt-5 pb-2'>
              <label
                htmlFor='name'
                className='block font-medium text-xl text-ascent-1 text-left'
              >
                Chỉnh sửa thông tin cá nhân
              </label>

              <button className='text-ascent-1' onClick={handleClose}>
                <MdClose size={22} />
              </button>
            </div>
            <form
              className='px-4 sm:px-6 flex flex-col gap-3 2xl:gap-6'
              onSubmit={handleSubmit(onSubmit)}
            >
               <label htmlFor='imgUpload'
                className={`
                  cursor-pointer my-4
                `}
              >
                <input
                  type='file'
                  className='hidden'
                  id='imgUpload'
                  onChange={(e) => handleSelect(e)}
                  accept='.jpg, .png, .jpeg'
                />

                <img
                  src={user?.profileUrl ?? NoProfile}
                  alt='user profile'
                  className={`
                    ${window.innerWidth < 768 ? 'w-[40%]' : 'w-[35%]'}
                    rounded-full object-cover mx-auto transition duration-300 ease-in-out hover:scale-110
                  `}
                />
              </label>

              <TextInput
                name='firstName'
                label={<span className="font-bold">Tên</span>}
                placeholder='Tên'
                type='text'
                styles='w-full'
                register={register("firstName", {
                  required: "Tên là bắt buộc!",
                })}
                error={errors.firstName ? errors.firstName?.message : ""}
              />

              <TextInput
                label={<span className="font-bold">Họ</span>}
                placeholder='Họ'
                type='lastName'
                styles='w-full'
                register={register("lastName", {
                  required: "Họ không khớp!",
                })}
                error={errors.lastName ? errors.lastName?.message : ""}
              />

              <TextInput
                name='bio'
                label={<span className="font-bold">Bio</span>}
                placeholder='Bio'
                type='text'
                styles='w-full'
                register={register("bio")}
                error={errors.bio ? errors.bio?.message : ""}
                defaultValue={user?.bio || ""}
              />

              <label>
                <span className={`font-bold text-ascent-2 text-sm mb-2 ${theme === 'dark' ? 'text-gray' : 'text-black'}`}>Giới tính</span>
                <select
                  id="gender"
                  value={selectedGender}
                  onChange={handleGenderChange}
                  className={`bg-secondary border-[#66666690] mb-2 outline-none text-sm text-ascent-2 placeholder:text-[#666] w-full border rounded-md py-2 px-3 mt-1`}
                >
                  <option value="" className={`text-ascent-2 text-sm mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </label>

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

              <div className='py-5 sm:flex sm:flex-row-reverse border-t border-[#66666645]'>
                {isSubmitting ? (
                  <Loading />
                ) : (
                  <CustomButton
                    type='submit'
                    containerStyles={`inline-flex justify-center rounded-md bg-blue px-8 py-3 text-sm font-medium text-white outline-none`}
                    title='Submit'
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
