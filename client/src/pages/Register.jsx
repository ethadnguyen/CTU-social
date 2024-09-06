import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { TbSocial } from "react-icons/tb";
import { BsShare } from "react-icons/bs";
import { AiOutlineInteraction } from "react-icons/ai";
import { ImConnection } from "react-icons/im";
import { CustomButton, Loading, TextInput } from "../components";
import { BgImage } from "../assets";

const Register = () => {
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm({
        mode: "onChange",
    });

    const onSubmit = async (data) => { };

    const [errMsg, setErrMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useDispatch();

    return (
        <div className='bg-bgColor w-full h-[100vh] flex items-center justify-center p-6'>
            <div className='flex flex-row-reverse w-full py-8 overflow-hidden shadow-xl md:w-2/3 h-fit lg:h-full 2xl:h-5/6 lg:py-0 bg-primary rounded-xl'>
                <div className='flex flex-col justify-center w-full h-full p-10 2xl:px-20 '>
                    <div className='flex items-center justify-center w-full gap-2 mb-6'>
                        <div className='p-2 bg-[#065ad8] rounded text-white'>
                            <TbSocial />
                        </div>
                        <span className='text-2xl text-[#065ad8] font-semibold' >
                            CTU Social
                        </span>
                    </div>

                    <p className='flex items-center justify-center text-base font-semibold text-ascent-1'>
                        Tạo tài khoản ngay
                    </p>

                    <form
                        className='flex flex-col gap-5 py-8'
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className='flex flex-col w-full gap-1 lg:flex-row md:gap-2'>
                            <TextInput
                                name='firstName'
                                label='Tên'
                                placeholder='Tên của bạn'
                                type='text'
                                styles='w-full'
                                register={register("firstName", {
                                    required: "Tên không được để trống",
                                })}
                                error={errors.firstName ? errors.firstName?.message : ""}
                            />

                            <TextInput
                                name='lastName'
                                label='Họ và tên lót'
                                placeholder='Họ và tên lót của bạn'
                                type='lastName'
                                styles='w-full'
                                register={register("lastName", {
                                    required: "Họ và tên lót không được để trống",
                                })}
                                error={errors.lastName ? errors.lastName?.message : ""}
                            />
                        </div>

                        <TextInput
                            name='email'
                            placeholder='email@student.ctu.edu.vn'
                            label='Email'
                            type='email'
                            register={register("email", {
                                required: "Email Address is required",
                            })}
                            styles='w-full'
                            error={errors.email ? errors.email.message : ""}
                        />

                        <div className='flex flex-col w-full gap-1 lg:flex-row md:gap-2'>
                            <TextInput
                                name='password'
                                label='Mật khẩu'
                                placeholder='Mật khẩu của bạn'
                                type='password'
                                styles='w-full'
                                register={register("password", {
                                    required: "Mật khẩu không được để trống",
                                })}
                                error={errors.password ? errors.password?.message : ""}
                            />

                            <TextInput
                                name='cPassword'
                                label='Xác nhận mật khẩu'
                                placeholder='Nhập lại mật khẩu'
                                type='password'
                                styles='w-full'
                                register={register("cPassword", {
                                    validate: (value) => {
                                        const { password } = getValues();

                                        if (password != value) {
                                            return "Mật khẩu không khớp";
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
                                containerStyles={`inline-flex justify-center rounded-full bg-blue hover:bg-sky-800 hover:border-sky-500 px-8 py-3 mt-4 text-sm font-medium text-white outline-none`}
                                title='Đăng ký'
                            />
                        )}
                    </form>

                    <p className='text-sm text-center text-ascent-2'>
                        Bạn đã có tài khoản?{" "}
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
    );
};

export default Register;