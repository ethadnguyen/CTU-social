import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { TbSocial } from "react-icons/tb";
import { CustomButton, Loading, SelectInput, TextInput } from "../components";
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

    const onSubmit = async (data) => {
        // Implement your registration logic here
    };

    const [errMsg, setErrMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useDispatch();

    const faculties = [
        { value: "IT", label: "Trường công nghệ thông tin & TT" },
        { value: "Economics", label: "Trường kinh tế" },
        { value: "Science", label: "Khoa khoa học tự nhiên" },
    ];
    const [selectedFaculty, setSelectedFaculty] = useState("");
    const handleFacultyChange = (e) => {
        setSelectedFaculty(e.value);
    };

    return (
        <div
            className="bg-bgColor w-full h-[100vh] flex items-center justify-center p-4"
            style={{
                backgroundImage: `url(${BgImage})`,
                backgroundSize: "cover",
                backdropFilter: "blur(8px)",
            }}
        >
            {/* START MODAL */}
            <div className="flex flex-col w-full h-full max-w-md max-h-full overflow-auto shadow-xl md:max-w-lg lg:max-w-xl bg-primary rounded-xl opacity-90">
                <div className="flex flex-col justify-center w-full h-full p-6 space-y-4 md:px-8 lg:px-12">
                    <div className="flex items-center justify-center w-full gap-2 mt-4">
                        <div className="hidden sm:flex p-2 bg-[#065ad8] rounded text-white">
                            <TbSocial size={24} />
                        </div>
                        <span className="text-xl text-[#065ad8] font-semibold">
                            CTU Social
                        </span>
                    </div>

                    <p className="items-center justify-center hidden text-sm font-semibold sm:flex text-ascent-1">
                        Tạo tài khoản ngay
                    </p>

                    <form
                        className="flex flex-col gap-4"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="flex flex-col w-full gap-2 md:flex-row md:gap-4">
                            <TextInput
                                name="firstName"
                                label="Tên"
                                placeholder="First Name"
                                type="text"
                                styles="w-full rounded-full text-sm"
                                register={register("firstName", {
                                    required: "Tên không được để trống",
                                })}
                                error={errors.firstName ? errors.firstName?.message : ""}
                            />

                            <TextInput
                                name="lastName"
                                label="Họ và tên đệm"
                                placeholder="Last Name"
                                type="lastName"
                                styles="w-full rounded-full text-sm"
                                register={register("lastName", {
                                    required: "Họ và tên đệm không được để trống",
                                })}
                                error={errors.lastName ? errors.lastName?.message : ""}
                            />
                        </div>

                        <div className="flex flex-col w-full gap-2 md:flex-row md:gap-4">
                            <TextInput
                                name="studentId"
                                label="Mã số sinh viên"
                                placeholder="B2110132"
                                type="studentId"
                                styles="w-full rounded-full text-sm"
                                register={register("studentId", {
                                    required: "Mã số sinh viên không được để trống",
                                })}
                                error={errors.studentId ? errors.studentId?.message : ""}
                            />
                            <TextInput
                                name="dateOfBirth"
                                label="Ngày sinh"
                                placeholder="08/13/2003"
                                type="date"
                                styles="w-full rounded-full text-sm"
                                register={register("dateOfBirth", {
                                    required: "Ngày sinh không được để trống",
                                })}
                                error={errors.dateOfBirth ? errors.dateOfBirth?.message : ""}
                            />
                        </div>

                        <TextInput
                            name="email"
                            placeholder="email@example.com"
                            label="Email"
                            type="email"
                            register={register("email", {
                                required: "Email không được để trống",
                            })}
                            styles="w-full rounded-full text-sm"
                            error={errors.email ? errors.email.message : ""}
                        />

                        <div className="flex flex-col w-full gap-2 md:flex-row md:gap-4">
                            <SelectInput
                                id="select-faculty"
                                name="select-faculty"
                                label="Khoa"
                                options={faculties}
                                selectedValue={selectedFaculty}
                                onChange={handleFacultyChange}
                                placeholder="Chọn khoa"
                                labelStyles={``}
                                styles={`w-full rounded-full text-sm`}
                                register={register("faculty", {
                                    required: "Khoa không được để trống",
                                })}
                            />

                            <SelectInput
                                id="select-major"
                                name="select-major"
                                label="Ngành/Chuyên ngành"
                                options={faculties}
                                selectedValue={selectedFaculty}
                                onChange={handleFacultyChange}
                                placeholder="Chọn ngành/chuyên ngành"
                                labelStyles={``}
                                styles={`w-full rounded-full text-sm`}
                                register={register("major", {
                                    required: "Ngành/chuyên ngành không được để trống",
                                })}
                            />
                        </div>

                        <div className="flex flex-col w-full gap-2 md:flex-row md:gap-4">
                            <TextInput
                                name="password"
                                label="Mật khẩu"
                                placeholder="Password"
                                type="password"
                                styles="w-full rounded-full text-sm"
                                register={register("password", {
                                    required: "Mật khẩu không được để trống",
                                })}
                                error={errors.password ? errors.password?.message : ""}
                            />

                            <TextInput
                                label="Xác nhận mật khẩu"
                                name="cPassword"
                                placeholder="Password"
                                type="password"
                                styles="w-full rounded-full text-sm"
                                register={register("cPassword", {
                                    validate: (value) => {
                                        const { password } = getValues();

                                        if (password != value) {
                                            return "Mật khẩu không trùng khớp";
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
                                    } mt-1`}
                            >
                                {errMsg?.message}
                            </span>
                        )}

                        {isSubmitting ? (
                            <Loading />
                        ) : (
                            <CustomButton
                                type="submit"
                                containerStyles={`inline-flex justify-center rounded-full hover:bg-sky-800 hover:border-sky-500 bg-blue px-6 py-2 text-sm font-medium text-white outline-none`}
                                title="Tạo tài khoản"
                            />
                        )}
                    </form>

                    <p className="mb-6 text-xs text-center text-ascent-2">
                        Bạn đã có tài khoản?{" "}
                        <Link
                            to="/login"
                            className="text-[#065ad8] font-semibold ml-2 cursor-pointer"
                        >
                            Đăng nhập
                        </Link>
                    </p>
                </div>
                {/* END MODAL */}
            </div>
        </div>
    );
};

export default Register;
