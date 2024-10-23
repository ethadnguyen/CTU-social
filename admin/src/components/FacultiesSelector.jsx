import React, { useState } from 'react';
import { faculties } from '../assets/register';
import { useForm } from 'react-hook-form';
import { AiFillDelete } from 'react-icons/ai';
import { IoMdAdd } from "react-icons/io";
import TextInput from './TextInput';

const FacultySelector = () => {
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const { register, handleSubmit } = useForm();

  // State cho input fields
  const [newFacultyName, setNewFacultyName] = useState('');
  const [newMajorName, setNewMajorName] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const { register: registerFaculty, handleSubmit: handleSubmitFaculty } = useForm();
  const { register: registerMajor, handleSubmit: handleSubmitMajor } = useForm();
  const { register: registerCourse, handleSubmit: handleSubmitCourse } = useForm();

  // Hàm xử lý click cho Khoa, Ngành, Khóa học
  const handleFacultyClick = (faculty) => {
    setSelectedFaculty(faculty);
    setSelectedMajor(null);
    setSelectedCourse(null);
  };

  const handleMajorClick = (major) => {
    setSelectedMajor(major);
    setSelectedCourse(null);
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
  };

  // Hàm xử lý thêm Khoa, Ngành, Khóa học
  const handleAddFaculty = (data) => {
    console.log("Thêm khoa:", data.facultyName);
    // ... (logic thêm khoa của bạn)
    setNewFacultyName('');
  };

  const handleAddMajor = (data) => {
    console.log("Thêm ngành:", data.majorName, "cho khoa", selectedFaculty.name);
    // ... (logic thêm ngành của bạn)
    setNewMajorName('');
  };

  const handleAddCourse = (data) => {
    console.log("Thêm khóa học:", data.courseName, "cho ngành", selectedMajor.name);
    // ... (logic thêm khóa học của bạn)
    setNewCourseName('');
  };

  // Hàm xử lý xóa Khoa, Ngành, Khóa học
  const handleDeleteFaculty = (facultyId) => {
    console.log("Xóa Khoa:", facultyId);
    // ... (logic xóa khoa của bạn)
  };

  const handleDeleteMajor = (majorId) => {
    console.log("Xóa ngành:", majorId);
    // ... (logic xóa ngành của bạn)
  };

  const handleDeleteCourse = (courseId) => {
    console.log("Xóa Khóa học:", courseId);
    // ... (logic xóa khóa học của bạn)
  };

  return (
    <div className="grid grid-cols-3 gap-4 overflow-y-auto min-h-screen">
      {/* Cột 1: Danh sách Khoa */}
      <div className="border-r flex-grow">
        <div className='flex items-center mr-3 justify-between text-xl text-ascent-1 pb-2 border-b mb-3 border-[#66666645]'>
            <span className="font-bold">Khoa</span>
            <form onSubmit={handleSubmitFaculty(handleAddFaculty)} className="flex items-center">
              {/* Sử dụng registerFaculty cho form Khoa */}
              <TextInput
                placeholder="Thêm khoa"
                name="facultyName"
                register={registerFaculty("facultyName", { required: true })}
                className="border border-gray rounded-l-md px-2 py-1 mr-1 focus:outline-none focus:ring-2 focus:ring-blue"
              />
              <button type="submit" className="">
                <IoMdAdd />
              </button>
            </form>
          </div>

        <ul className="rounded-md mr-3">
          {faculties.map((faculty) => (
            <li
              key={faculty.id}
              onClick={() => handleFacultyClick(faculty)}
              className={`cursor-pointer hover:bg-gray py-2 px-4 rounded-md relative 
                ${selectedFaculty?.id === faculty.id ? 'bg-sky text-white' : ''}`}
            >
              {faculty.name}
              <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 
                ${selectedFaculty?.id === faculty.id ? 'opacity-100' : 'opacity-0'}`}>
                <button onClick={() => handleDeleteFaculty(faculty.id)}>
                  <AiFillDelete className="text-red-500" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Cột 2: Danh sách Ngành */}
      <div className="border-r flex-grow">
        <div className='flex items-center mr-3 justify-between text-xl text-ascent-1 pb-2 border-b mb-3 border-[#66666645]'>
            <span className="font-bold">Ngành</span>
            <form onSubmit={handleSubmitMajor(handleAddMajor)} className="flex items-center">
              {/* Sử dụng registerMajor cho form Ngành */}
              <TextInput
                placeholder="Thêm ngành"
                name="majorName"
                register={registerMajor("majorName", { required: true })}
                className="border border-gray rounded-l-md px-2 py-1 mr-1 focus:outline-none focus:ring-2 focus:ring-blue"
              />
              <button type="submit" className="">
                <IoMdAdd />
              </button>
            </form>
          </div>

        {selectedFaculty && (
          <ul className="rounded-md mr-3">
            {selectedFaculty.majors.map((major) => (
              <li
                key={major.id}
                onClick={() => handleMajorClick(major)}
                className={`cursor-pointer hover:bg-gray py-2 px-4 rounded-md relative
                    ${selectedMajor?.id === major.id ? 'bg-sky text-white' : ''}`}
              >
                {major.name}
                <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 
                    ${selectedMajor?.id === major.id ? 'opacity-100' : 'opacity-0'}`}>
                  <button onClick={() => handleDeleteMajor(major.id)}>
                    <AiFillDelete className="text-red-500" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Cột 3: Danh sách Khóa học */}
      <div className="gap-4">
        <div className='flex items-center mr-3 justify-between text-xl text-ascent-1 pb-2 border-b mb-3 border-[#66666645]'>
            <span className="font-bold">Khóa học</span>
            <form onSubmit={handleSubmitCourse(handleAddCourse)} className="flex items-center">
              {/* Sử dụng registerCourse cho form Khóa học */}
              <TextInput
                placeholder="Thêm khóa học"
                name="courseName"
                register={registerCourse("courseName", { required: true })}
                className="border border-gray rounded-l-md px-2 py-1 mr-1 focus:outline-none focus:ring-2 focus:ring-blue"
              />
              <button type="submit" className="">
                <IoMdAdd />
              </button>
            </form>
          </div>

        {selectedMajor && (
          <ul className="rounded-md mr-3">
            {selectedMajor.courses.map((course) => (
              <li
                key={course.id}
                onClick={() => handleCourseClick(course)}
                className={`cursor-pointer hover:bg-gray py-2 px-4 rounded-md relative
                        ${selectedCourse?.id === course.id ? 'bg-sky text-white' : ''}`}
              >
                {course.name}
                <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 
                        ${selectedCourse?.id === course.id ? 'opacity-100' : 'opacity-0'}`}>
                  <button onClick={() => handleDeleteCourse(course.id)}>
                    <AiFillDelete className="text-red-500" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FacultySelector;