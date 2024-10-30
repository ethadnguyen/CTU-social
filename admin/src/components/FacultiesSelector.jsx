import { React, useState, useRef } from 'react';
import { faculties } from '../assets/register';
import { useForm } from 'react-hook-form';
import { AiFillDelete } from 'react-icons/ai';
import { IoMdAdd } from "react-icons/io";
import TextInput from './TextInput';
import { FaSearch, FaChevronDown, FaChevronUp, FaEdit } from "react-icons/fa";

const FacultySelector = () => {
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { register: registerFaculty, handleSubmit: handleSubmitFaculty } = useForm();
  const { register: registerMajor, handleSubmit: handleSubmitMajor } = useForm();
  const { register: registerCourse, handleSubmit: handleSubmitCourse } = useForm();
  const [showAddFacultyForm, setShowAddFacultyForm] = useState(false);
  const [showAddMajorForm, setShowAddMajorForm] = useState(false);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [editingFacultyId, setEditingFacultyId] = useState(null);
  const editInputRef = useRef(null);

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
  };

  const handleAddMajor = (data) => {
    console.log("Thêm ngành:", data.majorName, "cho khoa", selectedFaculty.name);
    // ... (logic thêm ngành)
  };

  const handleAddCourse = (data) => {
    console.log("Thêm khóa học:", data.courseName, "cho ngành", selectedMajor.name);
    // ... (logic thêm khóa học)
  };

  const handleEditFaculty = (facultyId) => {
    setEditingFacultyId(facultyId);
    setSelectedFaculty(null);
  };

  const handleFacultyNameChange = (event, facultyId) => {
    const updatedFaculties = faculties.map((faculty) =>
      faculty.id === facultyId ? { ...faculty, name: event.target.value } : faculty
    );
    // ... (update tên khoa khi server lưu thành công)
  };

  const handleFacultyNameKeyDown = (event, facultyId) => {
    if (event.key === 'Enter') {
      const updatedFacultyName = event.target.value; 
      console.log("Sửa khoa",facultyId," thành",updatedFacultyName);
      event.preventDefault();
      setEditingFacultyId(null);
      // ... (gọi API lưu thay đổi tên khoa)
    }
  };

  const handleDeleteFaculty = (facultyId) => {
    console.log("Xóa Khoa:", facultyId);
    // ... (logic xóa khoa)
  };

  const [editingMajorId, setEditingMajorId] = useState(null);

  const handleEditMajor = (majorId) => {
    setEditingMajorId(majorId);
    setSelectedMajor(null);
  };

  const handleMajorNameChange = (event, majorId) => {
    const updatedFaculties = faculties.map((faculty) => ({
      ...faculty,
      majors: faculty.majors.map((major) =>
        major.id === majorId ? { ...major, name: event.target.value } : major
      ),
    }));
    // ... (update tên ngành khi server lưu thành công)
  };

  const handleMajorNameKeyDown = (event, majorId) => {
    if (event.key === 'Enter') {
      const updatedMajorName = event.target.value;
      console.log("Sửa ngành", majorId, "của khoa", selectedFaculty.name, " thành", updatedMajorName);
      event.preventDefault();
      setEditingMajorId(null);
      // ... (gọi API lưu thay đổi tên ngành)
    }
  };

  const handleDeleteMajor = (majorId) => {
    console.log("Xóa ngành:", majorId);
    // ... (logic xóa ngành)
  };

  const [editingCourseId, setEditingCourseId] = useState(null);

  const handleEditCourse = (courseId) => {
    setEditingCourseId(courseId);
    setSelectedCourse(null);
  };

  const handleCourseNameChange = (event, courseId) => {
    const updatedFaculties = faculties.map((faculty) => ({
      ...faculty,
      majors: faculty.majors.map((major) => ({
        ...major,
        courses: major.courses.map((course) =>
          course.id === courseId ? { ...course, name: event.target.value } : course
        ),
      })),
    }));
    // ... (update tên khóa học khi server lưu thành công)
  };

  const handleCourseNameKeyDown = (event, courseId) => {
    if (event.key === 'Enter') {
      const updatedCourseName = event.target.value;
      console.log("Sửa khóa học", courseId, "thành", updatedCourseName);
      event.preventDefault();
      setEditingCourseId(null);
      // ... (gọi API lưu thay đổi tên khóa học)
    }
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
    <div className="grid grid-cols-3 gap-4 h-[calc(91vh-8rem)]">
      {/* Cột 1: Danh sách Khoa */}
      <div className="border-r flex-grow h-[calc(91vh-8rem)]">
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

        <ul className={`rounded-md mr-3 overflow-y-auto ${showAddFacultyForm ? 'h-[80%]' : 'h-[85%]'}`}>
          {filteredFaculties.map((faculty) => (
            <li
              key={faculty.id}
              onClick={() => {
                if (editingFacultyId === null) { 
                  handleFacultyClick(faculty)
                }
              }}              
              className={`cursor-pointer hover:bg-gray py-2 px-4 rounded-md relative 
                ${selectedFaculty?.id === faculty.id ? 'bg-sky text-white' : ''}`}
            >
              {editingFacultyId === faculty.id ? (
                <input
                  ref={editInputRef}
                  type="text"
                  defaultValue={faculty.name}
                  onChange={(event) => handleFacultyNameChange(event, faculty.id)}
                  onKeyDown={(event) => handleFacultyNameKeyDown(event, faculty.id)}
                  autoFocus
                  onBlur={() => setEditingFacultyId(null)}
                  className="bg-gray-100 border border-gray-300 text-asent-1 bg-secondary rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <>
                  {faculty.name}
                  <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 
                    ${selectedFaculty?.id === faculty.id ? '' : 'hidden'}`}>
                      <button className="mr-3" onClick={(event) => {
                        event.stopPropagation();
                        handleEditFaculty(faculty.id);
                      }}>
                        <FaEdit className="" />
                    </button>
                    <button className="mr-3" onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteFaculty(faculty.id);
                    }}>
                      <AiFillDelete className="" />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Cột 2: Danh sách Ngành */}
      <div className="border-r flex-grow h-[calc(91vh-8rem)]">
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
          <ul className={`rounded-md mr-3 overflow-y-auto ${showAddMajorForm ? 'h-[80%]' : 'h-[85%]'}`}>
            {filteredMajors.map((major) => (
              <li
                key={major.id}
                onClick={() => {
                  if (editingMajorId === null) {
                    handleMajorClick(major);
                  }
                }}
                className={`cursor-pointer hover:bg-gray py-2 px-4 rounded-md relative
                  ${selectedMajor?.id === major.id ? 'bg-sky text-white' : ''}`}
              >
                {editingMajorId === major.id ? (
                  <input
                    type="text"
                    defaultValue={major.name}
                    onChange={(event) => handleMajorNameChange(event, major.id)}
                    onKeyDown={(event) => handleMajorNameKeyDown(event, major.id)}
                    autoFocus
                    onBlur={() => setEditingMajorId(null)}
                    className="bg-gray-100 border border-gray-300 text-asent-1 bg-secondary rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <>
                    {major.name}
                    <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 
                      ${selectedMajor?.id === major.id ? '' : 'hidden'}`}>
                      <button className="mr-3" onClick={(event) => {
                        event.stopPropagation();
                        handleEditMajor(major.id);
                      }}>
                        <FaEdit className="" />
                      </button>
                      <button onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteMajor(major.id);
                      }}>
                        <AiFillDelete className="" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Cột 3: Danh sách Khóa học */}
      <div className="gap-4 h-[calc(91vh-8rem)]">
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
          <ul className={`rounded-md mr-3 overflow-y-auto ${showAddCourseForm ? 'h-[80%]' : 'h-[85%]'}`}>
            {filteredCourses.map((course) => (
              <li
                key={course.id}
                onClick={() => {
                  if (editingCourseId === null) {
                    handleCourseClick(course);
                  }
                }}
                className={`cursor-pointer hover:bg-gray py-2 px-4 rounded-md relative
                  ${selectedCourse?.id === course.id ? 'bg-sky text-white' : ''}`}
              >
                {editingCourseId === course.id ? (
                  <input
                    type="text"
                    defaultValue={course.name}
                    onChange={(event) => handleCourseNameChange(event, course.id)}
                    onKeyDown={(event) => handleCourseNameKeyDown(event, course.id)}
                    autoFocus
                    onBlur={() => setEditingCourseId(null)}
                    className="bg-gray-100 border border-gray-300 text-asent-1 bg-secondary rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <>
                    {course.name}
                    <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 
                      ${selectedCourse?.id === course.id ? '' : 'hidden'}`}>
                      <button className="mr-3" onClick={(event) => {
                        event.stopPropagation();
                        handleEditCourse(course.id);
                      }}>
                        <FaEdit className="" />
                      </button>
                      <button onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteCourse(course.id);
                      }}>
                        <AiFillDelete className="" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FacultySelector;