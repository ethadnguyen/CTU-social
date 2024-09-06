import React from 'react'
import PropTypes from 'prop-types'
import { TextInput } from './index'
const StepOneForm = ({ register, errors }) => {
    return (
        <div className="flex flex-col gap-5 py-8">
            <div className="flex flex-col w-full gap-1 lg:flex-row md:gap-2">
                <TextInput
                    name="firstName"
                    label="Tên"
                    placeholder="Tên của bạn"
                    type="text"
                    styles="w-full"
                    register={register("firstName", {
                        required: "Tên không được để trống",
                    })}
                    error={errors.firstName ? errors.firstName?.message : ""}
                />

                <TextInput
                    name="lastName"
                    label="Họ và tên lót"
                    placeholder="Họ và tên lót của bạn"
                    type="lastName"
                    styles="w-full"
                    register={register("lastName", {
                        required: "Họ và tên lót không được để trống",
                    })}
                    error={errors.lastName ? errors.lastName?.message : ""}
                />
            </div>

            <TextInput
                name="email"
                placeholder="email@student.ctu.edu.vn"
                label="Email"
                type="email"
                register={register("email", {
                    required: "Email không được để trống",
                })}
                styles="w-full"
                error={errors.email ? errors.email.message : ""}
            />

            <div className="flex flex-col w-full gap-1 lg:flex-row md:gap-2">
                <TextInput
                    name="password"
                    label="Mật khẩu"
                    placeholder="Mật khẩu của bạn"
                    type="password"
                    styles="w-full"
                    register={register("password", {
                        required: "Mật khẩu không được để trống",
                    })}
                    error={errors.password ? errors.password?.message : ""}
                />

                <TextInput
                    name="cPassword"
                    label="Xác nhận mật khẩu"
                    placeholder="Nhập lại mật khẩu"
                    type="password"
                    styles="w-full"
                    register={register("cPassword", {
                        validate: (value) => {
                            const { password } = getValues();
                            return password === value || "Mật khẩu không khớp";
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
    );
};

StepOneForm.propTypes = {
    register: PropTypes.func.isRequired,
    errors: PropTypes.object.isRequired,
};

export default StepOneForm;