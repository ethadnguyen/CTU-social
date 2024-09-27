import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { CustomButton, Loading, TextInput } from "../components";
import { BgImage } from "../assets";
import backgroundImage from '../assets/CTU.jpg';

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const onSubmit = async (data) => {};

  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  return (
    <div style={{ 
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'repeat'
    }}>
      <div className='w-full h-[100vh] flex items-center justify-center p-6'>
        <div className='w-full md:w-2/6 h-fit lg:h-full 2xl:h-5/6 py-8 lg:py-0 flex bg-primary rounded-xl overflow-hidden shadow-xl'>
          <div className='w-full lg:w h-full p-10 2xl:px-20 flex flex-col justify-center '>
            <div className='w-full flex gap-2 items-center justify-center mb-6'>
              <img src= {BgImage} className='w-14 h-14' />
              <span className='text-2xl text-[#065ad8] font-semibold'>
                CTU Social
              </span>
            </div>

            <p className='text-ascent-1 text-base font-semibold mx-auto'>
              Đăng nhập vào tài khoản của bạn
            </p>

            <form
              className='py-8 flex flex-col gap-5 overflow-y-auto'
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
                className='text-sm text-right text-blue font-semibold py-3'
              >
                Quên mật khẩu?
              </Link>

              {errMsg?.message && (
                <span
                  className={`text-sm ${
                    errMsg?.status == "failed"
                      ? "text-[#f64949fe]"
                      : "text-[#2ba150fe]"
                  } mt-0.5`}
                >
                  {errMsg?.message}
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

            <p className='text-ascent-2 text-sm text-center'>
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
