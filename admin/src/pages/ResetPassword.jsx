import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { CustomButton, Loading, TextInput } from "../components";
import backgroundImage from '../assets/CTU.jpg';

const ResetPassword = () => {
    const [errMsg, setErrMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,

        formState: { errors },
    } = useForm({
        mode: "onChange",
    });

    const onSubmit = async (data) => { };

    return (
        <div style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}>
            <div className='w-full h-[100vh] flex items-center justify-center p-6'>
                <div className='bg-primary w-full md:w-1/3 2xl:w-1/4 px-6 py-8 shadow-md rounded-lg'>
                    <p className='text-ascent-1 text-lg font-semibold'>Địa Chỉ Email</p>

                    <span className='text-sm text-ascent-2'>
                        Nhập địa chỉ email đã sử dụng khi đăng ký
                    </span>

                    <form
                        onSubmit={handleSubmit(onsubmit)}
                        className='py-4 flex flex-col gap-5'
                    >
                        <TextInput
                            name='email'
                            placeholder='B1234567@ctu.edu.vn'
                            type='email'
                            register={register("email", {
                                required: "Địa chỉ email là bắt buộc!",
                                pattern: {
                                    value: /^[A-Za-z0-9]+(@ctu\.edu\.vn)|(@+[A-Za-z]+\.+ctu\.edu\.vn)$/,
                                    message: "Email phải là mail của Đại Học Cần Thơ!"
                                }
                            })}
                            styles='w-full rounded-lg'
                            labelStyle='ml-2'
                            error={errors.email ? errors.email.message : ""}
                        />
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

                        {isSubmitting ? (
                            <Loading />
                        ) : (
                            <CustomButton
                                type='submit'
                                containerStyles={`inline-flex justify-center rounded-md bg-blue hover:bg-sky px-8 py-3 text-sm font-medium text-white outline-none`}
                                title='Gửi'
                            />
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
