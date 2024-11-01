import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { CustomButton, Loading, TextInput } from "../components";
import { BgImage } from "../assets";
import backgroundImage from '../assets/CTU.jpg';
// import axiosInstanceNoAuth from '../api/axiosNoAuth';
import axiosInstance from '../api/axiosConfig';

const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const email = watch('email');

  const handleSendActivationCode = async () => {
    setIsSendingCode(true);
    try {
      if (!email) {
        setErrMsg({ message: "Vui lòng nhập địa chỉ email!", status: "failed" });
        return;
      }
      const response = await axiosInstance.post('/admin/send-otp', { email });
      if (response.data.success) {
        const expiresAt = response.data.expiresAt;
        const currentTime = Date.now();
        const countdownTime = Math.max(Math.floor((expiresAt - currentTime) / 1000), 0);

        setCountdown(countdownTime); // Đặt countdown
        setErrMsg({ message: "Mã kích hoạt đã được gửi qua email!" });
      }
    } catch (error) {
      console.error("Lỗi gửi mã OTP:", error);
      setErrMsg({ message: "Gửi mã kích hoạt không thành công!", status: "failed" });
    } finally {
      setIsSendingCode(false);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [countdown]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    console.log(data);
    try {
      const response = await axiosInstance.post('/auth/admin/register', {
        ...data
      });
      if (response.data.status === "success") {
        setErrMsg({ message: response.data.message, status: "success" });
        // navigate("/login");
      } else {
        setErrMsg({ message: response.data.message, status: "failed" });
      }

    } catch (error) {
      console.error("Lỗi kích hoạt tài khoản:", error);
      setErrMsg({ message: "Kích hoạt tài khoản không thành công!", status: "failed" });
    } finally {
      setIsSubmitting(false);
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

              <TextInput
                name='securityCode'
                label={<span className="font-bold">Mã kích hoạt</span>}
                placeholder='Mã kích hoạt'
                type='password'
                styles='w-full rounded-full'
                labelStyle='ml-2'
                register={register("securityCode", {
                  required: "Mã kích hoạt là bắt buộc!",
                })}
                error={errors.password ? errors.password?.message : ""}
              />

              <p className='text-[#065ad8] font-semibold ml-2 cursor-pointer' onClick={handleSendActivationCode}>
                {isSendingCode ? "Đang gửi mã kích hoạt..." : "Gửi mã kích hoạt"}
              </p>

              {countdown > 0 && (
                <p className="text-sm text-center text-[#2ba150fe]">
                  Mã kích hoạt hết hạn trong: {formatTime(countdown)}
                </p>
              )}

              {errMsg?.message && (
                <span
                  className={`text-sm ${errMsg?.status == "failed"
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
                  title='Kích hoạt'
                />
              )}
            </form>

            <p className='text-ascent-2 text-sm text-center'>
              Đã kích hoạt tài khoản?{" "}
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