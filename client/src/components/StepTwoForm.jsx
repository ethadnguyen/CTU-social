import React from 'react';
import PropTypes from 'prop-types';
import { TextInput, SelectInput } from './index';
const StepTwoForm = ({ register, errors }) => {
    StepTwoForm.propTypes = {
        register: PropTypes.func.isRequired,
        errors: PropTypes.object.isRequired,
    };
    return (
        <div className="flex flex-col gap-5 py-8">
            <TextInput
                name="studentID"
                label="Mã số sinh viên"
                placeholder="Mã số sinh viên"
                type="text"
                styles="w-full"
                register={register("studentID", {
                    required: "Mã số sinh viên không được để trống",
                })}
                error={errors.studentID ? errors.studentID?.message : ""}
            />

            <SelectInput
                name="faculty"
                label="Khoa"
                options={[{ label: "Khoa A", value: "A" }, { label: "Khoa B", value: "B" }]} // replace with actual data
                register={register("faculty", {
                    required: "Khoa không được để trống",
                })}
                error={errors.faculty ? errors.faculty?.message : ""}
            />

            <SelectInput
                name="major"
                label="Chuyên ngành"
                options={[{ label: "Chuyên ngành X", value: "X" }, { label: "Chuyên ngành Y", value: "Y" }]} // replace with actual data
                register={register("major", {
                    required: "Chuyên ngành không được để trống",
                })}
                error={errors.major ? errors.major?.message : ""}
            />

            <SelectInput
                name="gender"
                label="Giới tính"
                options={[{ label: "Nam", value: "male" }, { label: "Nữ", value: "female" }, { label: "Khác", value: "other" }]}
                register={register("gender", {
                    required: "Giới tính không được để trống",
                })}
                error={errors.gender ? errors.gender?.message : ""}
            />

            <TextInput
                name="dob"
                label="Ngày sinh"
                type="date"
                styles="w-full"
                register={register("dob", {
                    required: "Ngày sinh không được để trống",
                })}
                error={errors.dob ? errors.dob?.message : ""}
            />
        </div>
    )
}

export default StepTwoForm;