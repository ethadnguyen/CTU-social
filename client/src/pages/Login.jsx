import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { TbSocial } from 'react-icons/tb';
import TextInput from '../components/TextInput';
import CustomButton from '../components/CustomButton';
import Loading from '../components/Loading';
import { BgImage } from '../assets';

const Login = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        mode: 'onChange',
    });

    const [errMsg, setErrMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useDispatch();

    return (
        <div className='bg-bgColor w-full h-[100vh] flex items-center justify-center p-6'
            style={{
                backgroundImage: `url(${BgImage})`,
                backgroundSize: 'cover',
                backdropFilter: 'blur(8px)',
            }}
        >
            <div
                className='flex w-full py-8 overflow-hidden shadow-xl lg:w-1/2 md:w-2/3 h-fit lg:h-full 2xl:h-5/6 lg:py-0 bg-primary rounded-xl opacity-90'
            >
                {/* LEFT */}
                <div
                    className='flex flex-col justify-center w-full h-full p-10 2xl:px-20'
                >
                    <div className='flex items-center justify-center w-full gap-2 mb-6'>
                        <div className='p-2 bg-[#065ad8] rounded text-white'>
                            <TbSocial />
                        </div>
                        <span className='text-2xl text-[#065ad8] font-semibold'>
                            CTU Social
                        </span>
                    </div>

                    <p className='flex items-center justify-center text-base font-semibold text-ascent-1'>
                        Đăng nhập vào tài khoản của bạn
                    </p>
                    <span className='flex items-center justify-center mt-2 text-sm text-ascent-2'>
                        Chào mừng trở lại nhé CTUers
                    </span>

                    <form className='py-8 flex flex-col gap-5='>
                        <TextInput
                            name='email'
                            id='email'
                            placeholder='email@student.ctu.edu.vn'
                            type='email'
                            label='Email'
                            register={
                                register('email', {
                                    required: 'Email không được để trống'
                                })
                            }
                            styles='w-full rounded-full'
                            labelStyles='ml-2'
                            error={errors.email ? errors.email.message : ''}
                        />
                        <TextInput
                            name='password'
                            id='password'
                            label='Mật khẩu'
                            placeholder='Mật khẩu'
                            type='password'
                            styles='w-full rounded-full'
                            labelStyles='ml-2'
                            register={register('password', {
                                required: 'Mật khẩu không được để trống'
                            })}
                            error={errors.password ? errors.password.message : ''}
                        />

                        <Link
                            to='/reset-password'
                            className='mt-4 text-sm font-semibold text-right text-blue'
                        >
                            Quên mật khẩu?
                        </Link>
                        {
                            errMsg?.message && (
                                <span
                                    className={`text-sm ${errMsg?.status == 'failed'
                                        ? 'text-[#f64949fe]'
                                        : 'text-[#2ba150fe]'} 
                                        mt-0.5
                                `}
                                >
                                    {errMsg?.message}
                                </span>
                            )
                        }
                        {isSubmitting ? (
                            <Loading />
                        ) : (
                            <CustomButton
                                type='submit'
                                containerStyles={`inline-flex justify-center rounded-full bg-blue hover:bg-sky-800 hover:border-sky-500 px-8 py-3 mt-4 text-sm font-medium text-white outline-none`}
                                title='Đăng nhập'
                            />
                        )}
                    </form>

                    <p className='text-sm text-center text-ascent-2'>
                        Bạn chưa có tài khoản?
                        <Link
                            to='/register'
                            className='text-[#065ad8] font-semibold ml-2 cursor-pointer'
                        >
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
                {/* RIGHT */}
                {/* <div className='flex-col items-center justify-center hidden w-1/2 h-full lg:flex bg-blue'
                >
                    <div className='relative flex items-center justify-center w-full'>
                        <img
                            src={BgImage}
                            alt='background'
                            className='object-cover w-48 h-48 rounded-full 2xl:w-64 2xl:h-64'
                        />
                    </div>
                </div> */}
            </div>
        </div>
    )
}

export default Login