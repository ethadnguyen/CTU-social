import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { CustomButton, Loading, TextInput } from "../components";
import { BgImage } from "../assets";
import backgroundImage from '../assets/CTU.jpg';
import { UserLogin } from "../redux/userSlice";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  // const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error } = useSelector(state => state.user);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    console.log(data)
    try {
      setIsSubmitting(true);
      await dispatch(UserLogin(data));
      setIsSubmitting(false);
      navigate("/");
    } catch (error) {
      // setErrMsg({ status: "failed", message: error.message });
      console.log(error)
    }
  };


  return (
    <div style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'repeat'
    }}>
      <div className='w-full h-[100vh] flex items-center justify-center p-6'>
        <div className='flex w-full py-8 overflow-hidden shadow-xl md:w-2/6 h-fit lg:h-full 2xl:h-5/6 lg:py-0 bg-primary rounded-xl'>
          <div className='flex flex-col justify-center w-full h-full p-10 lg:w 2xl:px-20 '>
            <div className='flex items-center justify-center w-full gap-2 mb-6'>
              <img src={BgImage} className='w-14 h-14' />
              <span className='text-2xl text-[#065ad8] font-semibold'>
                CTU Social
              </span>
            </div>

            <p className='mx-auto text-base font-semibold text-ascent-1'>
              Đăng nhập vào tài khoản của bạn
            </p>

            <form
              className='flex flex-col gap-5 py-8 overflow-y-auto'
              onSubmit={handleSubmit(onSubmit)}
            >
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
                styles='w-full rounded-full'
                labelStyle='ml-2'
                error={errors.email ? errors.email.message : ""}
              />

              <TextInput
                name='password'
                label={<span className="font-bold">Mật khẩu</span>}
                placeholder='Mật khẩu'
                type='password'
                styles='w-full rounded-full'
                labelStyle='ml-2'
                register={register("password", {
                  required: "Mật khẩu là bắt buộc!",
                })}
                error={errors.password ? errors.password?.message : ""}
              />

              <Link
                to='/reset-password'
                className='py-3 text-sm font-semibold text-right text-blue'
              >
                Quên mật khẩu?
              </Link>

              {error && (
                <span
                  className={`text-sm ${error
                    ? "text-[#f64949fe]"
                    : "text-[#2ba150fe]"
                    } mt-0.5`}
                >
                  {error}
                </span>
              )}

              {isSubmitting ? (
                <Loading />
              ) : (
                <CustomButton
                  type='submit'
                  containerStyles={`inline-flex justify-center rounded-md bg-blue hover:bg-sky px-8 py-3 text-sm font-medium text-white outline-none`}
                  title='Đăng nhập'
                />
              )}
            </form>

            <p className='text-sm text-center text-ascent-2'>
              Chưa có tài khoản?
              <Link
                to='/register'
                className='text-[#065ad8] font-semibold ml-2 cursor-pointer'
              >
                Tạo Tài Khoản
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
