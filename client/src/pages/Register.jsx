import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { CustomButton, Loading, TextInput, SelectInput } from "../components";
import { BgImage } from "../assets";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from "react-redux";
import backgroundImage from '../assets/CTU.jpg';

// import { faculties } from "../assets/register";
import { fetchFaculties, fetchMajors } from './../redux/facultySlice';

const Register = () => {
  const { theme } = useSelector((state) => state.theme);
  const { faculties, majors } = useSelector((state) => state.faculty);
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  // const [availableMajors, setAvailableMajors] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [showFacultyError, setShowFacultyError] = useState(false);
  const [showMajorError, setShowMajorError] = useState(false);
  const [showCourseError, setShowCourseError] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();


  useEffect(() => {
    dispatch(fetchFaculties());
  }, [dispatch]);

  useEffect(() => {
    if (selectedFaculty) {
      dispatch(fetchMajors(selectedFaculty));
    }
  }, [selectedFaculty, dispatch]);

  const onSubmit = async (data) => {
    console.log("is submitted");
  };

  console.log(selectedFaculty);


  const steps = [
    {
      title: "Thông tin cá nhân",
      content: (
        <div className='w-full flex-content flex-col lg:flex-row gap-1 md:gap-2'>
          <div className='w-full flex flex-col lg:flex-row gap-1 md:gap-2'>
            <TextInput
              name='firstName'
              label={<span className="font-bold">Tên</span>}
              placeholder='Tên'
              type='text'
              styles='w-full'
              register={register("firstName", {
                required: "Tên không được để trống!",
              })}
              error={errors.firstName ? errors.firstName?.message : ""}
            />

            <TextInput
              label={<span className="font-bold">Họ</span>}
              placeholder='Họ'
              type='lastName'
              styles='w-full'
              register={register("lastName", {
                required: "Họ không được để trống!",
              })}
              error={errors.lastName ? errors.lastName?.message : ""}
            />
          </div>

          <div className='w-full flex flex-col lg:flex-row gap-1 md:gap-2'>
            <TextInput
              name='mssv'
              label={<span className="font-bold">Mã số sinh viên</span>}
              placeholder='B1234567'
              type='text'
              styles='w-full'
              register={register("mssv", {
                required: "Mã số sinh viên không được để trống!",
              })}
              error={errors.mssv ? errors.mssv?.message : ""}
            />
          </div>

          <div className='w-full my-1 lg:flex-row gap-1 md:gap-2'>
            <SelectInput
              label='Khoa'
              value={selectedFaculty}
              onChange={(e) => {
                setSelectedFaculty(e.target.value);
                setShowFacultyError(false);
              }}
              options={[
                { value: "", label: "Chọn khoa" },
                ...faculties.map((faculty) => ({
                  value: faculty._id,
                  label: faculty.name,
                })),
              ]}
              styles='w-full'
            />

            {showFacultyError && (
              <div className="text-red text-sm">Vui lòng chọn Khoa!</div>
            )}

            <div className="w-full flex gap-1">
              <div className="flex flex-col w-full">
                <SelectInput
                  label='Ngành'
                  value={selectedMajor}
                  onChange={(e) => {
                    setSelectedMajor(e.target.value);
                    console.log(e.target.value);
                    setShowMajorError(false); // Ẩn thông báo lỗi khi người dùng chọn lại
                  }}
                  options={[
                    { value: "", label: "Chọn ngành" },
                    ...majors.map((major) => ({
                      value: major._id,
                      label: major.majorName,
                    })),
                  ]}
                  styles='w-full'
                />
                {showMajorError && (
                  <div className="text-red text-sm">Vui lòng chọn Ngành!</div>
                )}
              </div>

              <div className="flex flex-col w-full">
                <SelectInput
                  label='Khóa'
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value);
                    setShowCourseError(false); // Ẩn thông báo lỗi khi người dùng chọn lại
                  }}
                  options={[
                    { value: "", label: "Chọn khóa" },
                    ...(selectedMajor && majors.find(major => major._id === selectedMajor)?.academicYear || []).map((course) => ({
                      value: course,
                      label: course,
                    })),
                  ]}
                  styles='w-full'
                />
                {showCourseError && (
                  <div className="text-red text-sm">Vui lòng chọn Khóa!</div>
                )}
              </div>
            </div>



            {/* <div className="w-full flex flex-col relative">
                {showMajorError && (
                  <div className="flex justify-start text-red text-sm">Vui lòng chọn Ngành!</div>
                )}
                {showCourseError && (
                  <div className="flex justify-end text-red text-sm">Vui lòng chọn Khóa!</div>
                )}
              </div> */}

          </div>
        </div>
      ),
    },

    {
      title: "Thông tin đăng nhập",
      content: (
        <div className='w-full flex-content flex-col lg:flex-row gap-1 md:gap-2'>

          <div className='w-full flex flex-col lg:flex-row gap-1 md:gap-2'>
            <TextInput
              name='birthdate'
              label={<span className="font-bold">Ngày sinh</span>}
              type='date'
              styles='w-full'
              register={register("birthdate", {
                required: "Ngày sinh không được để trống!"
              })}
              error={errors.birthdate ? errors.birthdate.message : ""}
            />
          </div>

          <div className='w-full my-1 flex flex-col lg:flex-row gap-1 md:gap-2'>
            <TextInput
              name='email'
              placeholder='B1234567@ctu.edu.vn'
              label={<span className="font-bold">Địa chỉ email</span>}
              type='email'
              register={register("email", {
                required: "Địa chỉ Email là bắt buộc!",
                pattern: {
                  value: /^[A-Za-z0-9]+(@ctu\.edu\.vn)|(@+[A-Za-z]+\.+ctu\.edu\.vn)$/,
                  message: "Email phải là mail của Đại Học Cần Thơ!"
                }
              })}
              styles='w-full'
              error={errors.email ? errors.email.message : ""}
            />
          </div>

          <div className='w-full my-1 flex flex-col lg:flex-row gap-1 md:gap-2'>
            <TextInput
              name='password'
              label={<span className="font-bold">Mật khẩu</span>}
              placeholder='Mật khẩu'
              type='password'
              styles='w-full'
              register={register("password", {
                required: "Mật khẩu là bắt buộc!",
              })}
              error={errors.password ? errors.password?.message : ""}
            />

            <TextInput
              label={<span className="font-bold">Xác nhận mật khẩu</span>}
              placeholder='Mật khẩu'
              type='password'
              styles='w-full'
              register={register("cPassword", {
                validate: (value) => {
                  const { password } = getValues();

                  if (password != value) {
                    return "Mật khẩu không khớp!";
                  }
                },
              })}
              error={
                errors.cPassword && errors.cPassword.type === "validate"
                  ? errors.cPassword?.message
                  : ""
              }
            />
          </div>

        </div>
      ),
    },
  ];

  const handleNextStep = async () => {
    const fieldsToValidate = currentStep === 1
      ? ["firstName", "lastName", "mssv", "faculty", "major", "course"]
      : ["email", "birthdate", "password", "cPassword"];

    let isValid = await trigger(fieldsToValidate);
    //validate
    if (!selectedFaculty) {
      setShowFacultyError(true);
      isValid = false;
    }
    if (!selectedMajor) {
      setShowMajorError(true);
      isValid = false;
    }
    if (!selectedCourse) {
      setShowCourseError(true);
      isValid = false;
    }

    console.log(selectedFaculty, selectedMajor, selectedCourse)

    if (isValid) {
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  return (
    <div style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className='w-full h-[100vh] flex items-center justify-center p-6'>
        <div className='w-full md:w-1/3 h-fit lg:h-fix 2xl:h-5/7 py-8 lg:py-0 flex flex-row-reverse justify-center bg-primary rounded-xl overflow-hidden shadow-xl'>
          <div className='w-full h-full mb-10 mt-10 p-10 2xl:px-20 flex flex-col overflow-y-auto'>
            <div className='w-full flex gap-2 items-center mb-6 justify-center'>
              <img src={BgImage} className='w-14 h-14' />
              <span className='text-2xl text-[#065ad8] font-semibold' >
                CTU Social
              </span>
            </div>

            <p className='text-ascent-1 text-base font-semibold mx-auto'>
              Tạo tài khoản của bạn
            </p>

            <form
              className='py-8 flex flex-col gap-5'
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className={`${currentStep === 1 ? '' : 'hidden'}`}>
                {steps[0].content}
              </div>
              <div className={`${currentStep === 2 ? '' : 'hidden'}`}>
                {steps[1].content}
              </div>

              {/* Nút điều hướng */}
              <div className="flex justify-between items-center">
                {currentStep >= steps.length ? (
                  <button onClick={handlePreviousStep} type="button" disabled={currentStep === 1} className={`${theme === 'dark' ? 'text-white' : ''} `}>
                    <FontAwesomeIcon icon={faChevronLeft} className={`${theme === 'dark' ? 'text-white' : ''}`} /> Quay lại
                  </button>
                ) : null}

                {currentStep < steps.length ? (
                  <button type="button" className="bg-transparent">
                  </button>
                ) : null}

                {currentStep < steps.length ? (
                  <button type="button" className={`${theme === 'dark' ? 'text-white' : ''} `} onClick={handleNextStep}>
                    Tiếp tục <FontAwesomeIcon icon={faChevronRight} className={`${theme === 'dark' ? 'text-white' : ''}`} />
                  </button>
                ) : null}
              </div>

              {currentStep === steps.length && (
                <div className="text-center mt-5">
                  {isSubmitting ? (
                    <Loading />
                  ) : (
                    <CustomButton
                      type='submit'
                      containerStyles={`inline-flex justify-center rounded-md bg-blue hover:bg-sky px-8 py-3 text-sm font-medium text-white outline-none`}
                      title='Tạo Tài Khoản'
                    />
                  )}
                </div>
              )}
            </form>
            <p className='text-ascent-2 text-sm text-center'>
              Đã có tài khoản?{" "}
              <Link
                to='/login'
                className='text-[#065ad8] font-semibold ml-2 cursor-pointer'
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;