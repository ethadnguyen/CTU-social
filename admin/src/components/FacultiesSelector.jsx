import React, { useState } from 'react';
import { faculties } from '../assets/register';
import { useForm } from 'react-hook-form';
import { AiFillDelete } from 'react-icons/ai';
import { IoMdAdd } from "react-icons/io";
import TextInput from './TextInput';
import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";

const FacultySelector = () => {
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const { register, handleSubmit } = useForm();

  const [newFacultyName, setNewFacultyName] = useState('');
  const [newMajorName, setNewMajorName] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const { register: registerFaculty, handleSubmit: handleSubmitFaculty } = useForm();
  const { register: registerMajor, handleSubmit: handleSubmitMajor } = useForm();
  const { register: registerCourse, handleSubmit: handleSubmitCourse } = useForm();
  const [showAddFacultyForm, setShowAddFacultyForm] = useState(false);
  const [showAddMajorForm, setShowAddMajorForm] = useState(false);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);

  const handleShowAddMajorForm = () => {
    if(selectedFaculty===null);
    else
      setShowAddMajorForm(!showAddMajorForm);
  };

  const handleShowAddCourseForm = () => {
    if(selectedMajor===null);
    else
      setShowAddCourseForm(!showAddCourseForm);
  };

  const handleFacultyClick = (faculty) => {
    if (selectedFaculty === faculty) {
      setSelectedFaculty(null);
      setSelectedMajor(null);
      setSelectedCourse(null);
      setShowAddMajorForm(false);
      setShowAddCourseForm(false);
    } else {
      setSelectedFaculty(faculty);
      setSelectedMajor(null);
      setSelectedCourse(null);
    }
  };

  const handleMajorClick = (major) => {
    if (selectedMajor === major) {
      setSelectedMajor(null);
      setSelectedCourse(null);
      setShowAddCourseForm(false);
    } else {
      setSelectedMajor(major);
      setSelectedCourse(null);
    }
  };
  
  const handleCourseClick = (course) => {
    if (selectedCourse === course) {
      setSelectedCourse(null);
    } else {
      setSelectedCourse(course);
    }
  };  

  const handleAddFaculty = (data) => {
    console.log("Thêm khoa:", data.facultyName);
    // ... (logic thêm khoa)
    setNewFacultyName('');
  };

  const handleAddMajor = (data) => {
    console.log("Thêm ngành:", data.majorName, "cho khoa", selectedFaculty.name);
    // ... (logic thêm ngành)
    setNewMajorName('');
  };

  const handleAddCourse = (data) => {
    console.log("Thêm khóa học:", data.courseName, "cho ngành", selectedMajor.name);
    // ... (logic thêm khóa học)
    setNewCourseName('');
  };

  const handleDeleteFaculty = (facultyId) => {
    console.log("Xóa Khoa:", facultyId);
    // ... (logic xóa khoa)
  };

  const handleDeleteMajor = (majorId) => {
    console.log("Xóa ngành:", majorId);
    // ... (logic xóa ngành)
  };

  const handleDeleteCourse = (courseId) => {
    console.log("Xóa Khóa học:", courseId);
    // ... (logic xóa khóa học)
  };

  const [searchFaculty, setSearchFaculty] = useState('');
  const [searchMajor, setSearchMajor] = useState('');
  const [searchCourse, setSearchCourse] = useState('');

  const handleSearchFacultyChange = (event) => {
    setSearchFaculty(event.target.value);
    console.log("Đang tìm kiếm khoa:", event.target.value);
  };

  const filteredFaculties = faculties.filter((faculty) =>
    faculty.name.toLowerCase().includes(searchFaculty.toLowerCase())
  );

  const handleSearchMajorChange = (event) => {
    setSearchMajor(event.target.value);
    console.log("Đang tìm kiếm ngành:", event.target.value);
  };

  const filteredMajors = selectedFaculty?.majors.filter((major) =>
    major.name.toLowerCase().includes(searchMajor.toLowerCase())
  );

  const handleSearchCourseChange = (event) => {
    setSearchCourse(event.target.value);
    console.log("Đang tìm kiếm khóa học:", event.target.value);
  };

  const filteredCourses = selectedMajor?.courses.filter((course) =>
    course.name.toLowerCase().includes(searchCourse.toLowerCase())
  );

  return (
    <div className="grid grid-cols-3 gap-4 overflow-y-auto min-h-screen">
      {/* Cột 1: Danh sách Khoa */}
      <div className="border-r flex-grow">
        <div className='flex flex-col items-start mr-3 justify-between text-xl text-ascent-1 pb-2 border-b mb-3 border-[#66666645]'>
          <div className="flex items-center justify-between w-full mb-3">
            <span className="font-bold">Khoa</span> 
            <div className="flex items-center">
              <TextInput
                placeholder="Tìm khoa"
                name="SearchFaculty"
                value={searchFaculty}
                onChange={handleSearchFacultyChange}
                className="border border-gray rounded-l-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue"
              />

              <button type="button" className="ml-2">
                <FaSearch />
              </button>
            </div>
          </div>

          <div className="w-full">
            <button 
              onClick={() => setShowAddFacultyForm(!showAddFacultyForm)}
              className="w-full rounded-md px-2 py-1 text-left"
            >
              <div className="ml-[45%] mr-[50%]">
                {showAddFacultyForm ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </div>
            </button>
            {showAddFacultyForm && (
              <form 
                onSubmit={handleSubmitFaculty(handleAddFaculty)} 
                className="flex items-center justify-center mt-2"
              >
                <input
                  placeholder="Thêm khoa"
                  name="facultyName"
                  {...registerFaculty("facultyName", { required: true })}
                  className="bg-secondary ml-1 border border-gray w-full rounded-l-md px-2 py-1 mr-1" 
                />
                <button type="submit" className="border ml-3 rounded-md hover:bg-sky"> 
                  <IoMdAdd />
                </button>
              </form>
            )}
          </div>
        </div>

        <ul className="rounded-md mr-3">
          {filteredFaculties.map((faculty) => (
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
          <div className='flex flex-col items-start mr-3 justify-between text-xl text-ascent-1 pb-2 border-b mb-3 border-[#66666645]'>
            <div className="flex items-center justify-between w-full mb-3">
              <span className="font-bold">Ngành</span> 
              <div className="flex items-center">
                <TextInput
                  placeholder="Tìm ngành"
                  name="SearchMajor"
                  value={searchMajor}
                  onChange={handleSearchMajorChange}
                  className="border border-gray rounded-l-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue"
                />

                <button type="button" className="ml-2">
                  <FaSearch />
                </button>
              </div>
            </div>

          <div className="w-full">
            <button 
              onClick={handleShowAddMajorForm}
              className="w-full rounded-md px-2 py-1 text-left"
            >
              <div className="ml-[45%] mr-[50%]">
                {showAddMajorForm ? (
                  <FaChevronUp className={selectedFaculty ? '' : 'opacity-25'} />
                ) : (
                  <FaChevronDown className={selectedFaculty ? '' : 'opacity-25'} />
                )}
              </div>
            </button>

            {showAddMajorForm && selectedFaculty && (
              <form
                onSubmit={handleSubmitMajor(handleAddMajor)}
                className="flex items-center justify-center mt-2"
              >
                <input
                  placeholder="Thêm ngành"
                  name="facultyName"
                  {...registerMajor("majorName", { required: true })}
                  className="bg-secondary ml-1 border border-gray w-full rounded-l-md px-2 py-1 mr-1"
                />
                <button type="submit" className="border ml-3 rounded-md hover:bg-sky">
                  <IoMdAdd />
                </button>
              </form>
            )}

          </div>
        </div>

        {selectedFaculty && (
          <ul className="rounded-md mr-3">
            {filteredMajors.map((major) => (
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
          <div className='flex flex-col items-start mr-3 justify-between text-xl text-ascent-1 pb-2 border-b mb-3 border-[#66666645]'>
            <div className="flex items-center justify-between w-full mb-3">
              <span className="font-bold">Khóa học</span> 
              <div className="flex items-center">
                <TextInput
                  placeholder="Tìm khóa học"
                  name="SearchCourse"
                  value={searchCourse}
                  onChange={handleSearchCourseChange}
                  className="border border-gray rounded-l-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue"
                />

                <button type="button" className="ml-2">
                  <FaSearch />
                </button>
              </div>
            </div>

          <div className="w-full">
            <button 
              onClick={handleShowAddCourseForm}
              className="w-full rounded-md px-2 py-1 text-left"
            >
              <div className="ml-[45%] mr-[50%]">
                {showAddCourseForm ? (
                  <FaChevronUp className={selectedMajor ? '' : 'opacity-25'} />
                ) : (
                  <FaChevronDown className={selectedMajor ? '' : 'opacity-25'} />
                )}
              </div>
            </button>
            
            {showAddCourseForm && selectedMajor && (
              <form 
                onSubmit={handleSubmitCourse(handleAddCourse)}
                className="flex items-center justify-center mt-2"
              >
                <input
                  placeholder="Thêm khóa học"
                  name="facultyName"
                  {...registerCourse("courseName", { required: true })}
                  className="bg-secondary ml-1 border border-gray w-full rounded-l-md px-2 py-1 mr-1" 
                />
                <button type="submit" className="border ml-3 rounded-md hover:bg-sky"> 
                  <IoMdAdd />
                </button>
              </form>
            )}
          </div>
        </div>

        {selectedMajor && (
          <ul className="rounded-md mr-3">
            {filteredCourses.map((course) => (
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