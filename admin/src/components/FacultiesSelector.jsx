import { React, useState, useRef } from 'react';
// import { faculties } from '../assets/register';
import { useForm } from 'react-hook-form';
import { AiFillDelete } from 'react-icons/ai';
import { IoMdAdd } from "react-icons/io";
import TextInput from './TextInput';
import { FaSearch, FaChevronDown, FaChevronUp, FaEdit } from "react-icons/fa";
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { addCourse, addFaculty, addMajor, deleteCourse, deleteFaculty, deleteMajor, fetchFaculties, fetchMajors, updateCourse, updateFaculty, updateMajor } from '../redux/facultySlice';
import { toast } from 'react-toastify';
const FacultySelector = () => {
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { register: registerFaculty, handleSubmit: handleSubmitFaculty, reset: resetFacultyForm } = useForm();
  const { register: registerMajor, handleSubmit: handleSubmitMajor, reset: resetMajorForm } = useForm();
  const { register: registerCourse, handleSubmit: handleSubmitCourse, reset: resetCourseForm } = useForm();
  const [showAddFacultyForm, setShowAddFacultyForm] = useState(false);
  const [showAddMajorForm, setShowAddMajorForm] = useState(false);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [editingFacultyId, setEditingFacultyId] = useState(null);
  const editInputRef = useRef(null);
  const { faculties, majors, error } = useSelector(state => state.faculty);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchFaculties());
  }, [dispatch]);

  useEffect(() => {
    if (selectedFaculty) {
      dispatch(fetchMajors(selectedFaculty._id));
    }
  }, [selectedFaculty, dispatch]);

  const handleShowAddMajorForm = () => {
    if (selectedFaculty === null);
    else
      setShowAddMajorForm(!showAddMajorForm);
  };

  const handleShowAddCourseForm = () => {
    if (selectedMajor === null);
    else
      setShowAddCourseForm(!showAddCourseForm);
  };

  const handleFacultyClick = (faculty) => {
    console.log('faculty', faculty);
    console.log('selectedFaculty', selectedFaculty);
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

  useEffect(() => {
    console.log('Updated selectedFaculty:', selectedFaculty);
  }, [selectedFaculty]);

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

  const handleAddFaculty = async (data) => {
    console.log("Thêm khoa:", data.facultyName);
    const response = await dispatch(addFaculty({ name: data.facultyName }));
    console.log('response faculty:', response);
    if (response?.payload.faculty) {
      toast.success(`Thêm khoa thành công!`);
    }
    else {
      toast.error(response.payload);
    }
    resetFacultyForm();
    setShowAddFacultyForm(false);
  };

  const handleAddMajor = async (data) => {
    console.log("Thêm ngành:", data.majorName, "cho khoa", selectedFaculty.name);
    const response = await dispatch(addMajor({ majorName: data.majorName, facultyId: selectedFaculty._id }));
    console.log('response major: ', response);
    if (response?.payload.major) {
      toast.success(`Thêm ngành thành công!`);
    } else {
      toast.error(response.payload);
    }
    resetMajorForm();
    setShowAddMajorForm(false);
  };

  const handleAddCourse = async (data) => {
    console.log('courseName', data.courseName);
    console.log("Thêm khóa học:", data.courseName, "cho ngành", selectedMajor.majorName);
    const response = await dispatch(addCourse({ majorId: selectedMajor._id, course: data.courseName }));
    console.log('response:', response);
    if (response?.payload.major) {
      setSelectedMajor((prevMajor) => ({
        ...prevMajor,
        academicYear: [...prevMajor.academicYear, response.payload.course]
      }));
      toast.success(`Thêm niên khóa thành công!`);
    }
    toast.error(response.payload);
    resetCourseForm();
    setShowAddCourseForm(false);
  };

  const handleEditFaculty = (facultyId) => {
    setEditingFacultyId(facultyId);
    setSelectedFaculty(null);
  };

  const handleFacultyNameChange = (event, facultyId) => {
    const updatedFaculties = faculties.map((faculty) =>
      faculty._id === facultyId ? { ...faculty, name: event.target.value } : faculty
    );
    setSelectedFaculty(updatedFaculties.find((faculty) => faculty._id === facultyId));
  };

  const handleFacultyNameKeyDown = async (event, facultyId) => {
    if (event.key === 'Enter') {
      const updatedFacultyName = event.target.value;
      console.log("Sửa khoa", facultyId, " thành", updatedFacultyName);
      event.preventDefault();

      const response = await dispatch(updateFaculty({ facultyId, name: updatedFacultyName }));

      if (response?.payload.faculty) {
        dispatch(fetchFaculties());
        toast.success(`Cập nhật khoa thành công!`);
      } else {
        toast.error(response.payload);
      }
      setEditingFacultyId(null);
    }
  };

  const handleDeleteFaculty = async (facultyId) => {
    console.log("Xóa Khoa:", facultyId);
    const response = await dispatch(deleteFaculty(facultyId));

    if (response.payload.faculty) {
      dispatch(fetchFaculties());
      toast.success(`Xóa khoa thành công!`);
    } else {
      toast.error(response.payload);
    }
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
        major._id === majorId ? { ...major, majorName: event.target.value } : major
      ),
    }));
    // ... (update tên ngành khi server lưu thành công)
    setSelectedMajor(updatedFaculties.find((faculty) => faculty._id === selectedFaculty._id).majors.find((major) => major._id === majorId));
  };

  const handleMajorNameKeyDown = async (event, majorId) => {
    if (event.key === 'Enter') {
      const updatedMajorName = event.target.value;
      console.log("Sửa ngành", majorId, "của khoa", selectedFaculty.name, " thành", updatedMajorName);
      event.preventDefault();
      setEditingMajorId(null);
      const response = await dispatch(updateMajor({ majorId, data: { majorName: updatedMajorName, facultyId: selectedFaculty._id } }));
      if (response?.payload.major) {
        dispatch(fetchMajors(selectedFaculty._id));
        toast.success(`Cập nhật ngành thành công!`);
      } else {
        toast.error(response.payload);
      }
    }
  };

  const handleDeleteMajor = async (majorId) => {
    console.log("Xóa ngành:", majorId);
    const response = await dispatch(deleteMajor(majorId));

    if (response.payload.major) {
      dispatch(fetchMajors(selectedFaculty._id));
      toast.success(`Xóa ngành thành công!`);
    } else {
      toast.error(response.payload);
    }
  };

  const [editingCourse, setEditingCourse] = useState(null);

  const handleEditCourse = (course) => {
    setEditingCourse(course);
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

  const handleCourseNameKeyDown = async (event, course) => {
    if (event.key === 'Enter') {
      const updatedCourseName = event.target.value;
      console.log("Sửa khóa học", course, "thành", updatedCourseName);
      event.preventDefault();
      setEditingCourse(null);
      const response = await dispatch(updateCourse({ majorId: selectedMajor._id, course: updatedCourseName }));

      if (response?.payload.major) {
        setSelectedMajor((prevMajor) => ({
          ...prevMajor,
          academicYear: prevMajor.academicYear.map((c) => c === course ? updatedCourseName : c)
        }));
        toast.success(`Cập nhật niên khóa thành công!`);
      } else {
        toast.error(response.payload);
      }
    }
  };

  const handleDeleteCourse = async (course) => {
    console.log("Xóa Khóa học:", course);
    const response = await dispatch(deleteCourse({ majorId: selectedMajor._id, course }));

    if (response.payload.major) {
      setSelectedMajor((prevMajor) => ({
        ...prevMajor,
        academicYear: prevMajor.academicYear.filter((c) => c !== course)
      }));
      toast.success(`Xóa niên khóa thành công!`);
    } else {
      toast.error(response.payload);
    }
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

  const filteredMajors = majors.filter((major) =>
    major?.majorName.toLowerCase().includes(searchMajor.toLowerCase())
  );

  const handleSearchCourseChange = (event) => {
    setSearchCourse(event.target.value);
    console.log("Đang tìm kiếm khóa học:", event.target.value);
  };

  const filteredCourses = selectedMajor?.academicYear.filter((course) =>
    course.toLowerCase().includes(searchCourse.toLowerCase())
  );

  return (
    <div className="grid grid-cols-3 gap-4 h-full overflow-hidden">
      {/* Cột 1: Danh sách Khoa */}
      <div className="border-r flex-grow h-full">
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
              key={faculty._id}
              onClick={() => {
                if (editingFacultyId === null) {
                  handleFacultyClick(faculty)
                }
              }}
              className={`cursor-pointer hover:bg-gray py-2 px-4 mt-2 rounded-md relative 
                ${selectedFaculty?._id === faculty._id ? 'bg-sky text-white' : ''} `}
            >
              {editingFacultyId === faculty._id ? (
                <input
                  ref={editInputRef}
                  type="text"
                  defaultValue={faculty.name}
                  onChange={(event) => handleFacultyNameChange(event, faculty._id)}
                  onKeyDown={(event) => handleFacultyNameKeyDown(event, faculty._id)}
                  autoFocus
                  onBlur={() => setEditingFacultyId(null)}
                  className="bg-gray-100 border border-gray-300 text-ascent-1 bg-secondary rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <>
                  <p className={`${faculty.isDeleted ? 'opacity-25' : ''} truncate w-[180px]`}>{faculty.name}</p>
                  <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 
                    ${selectedFaculty?._id === faculty._id ? '' : 'hidden'} `}>
                    <button className="mr-3" onClick={(event) => {
                      event.stopPropagation();
                      handleEditFaculty(faculty._id);
                    }}>
                      <FaEdit className="" />
                    </button>
                    <button className="mr-3" onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteFaculty(faculty._id);
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
      <div className="border-r flex-grow h-full">
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
                  name="majorName"
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
          <ul className={`rounded-md mr-3 overflow-y-auto ${showAddMajorForm ? 'h-[80%]' : 'h-[85%]'} `}>
            {filteredMajors.map((major) => (
              <li
                key={major._id}
                onClick={() => {
                  if (editingMajorId === null) {
                    handleMajorClick(major);
                  }
                }}
                className={`cursor-pointer hover:bg-gray py-2 px-4 rounded-md relative
                  ${selectedMajor?._id === major._id ? 'bg-sky text-white' : ''} `}
              >
                {editingMajorId === major._id ? (
                  <input
                    type="text"
                    defaultValue={major.majorName}
                    onChange={(event) => handleMajorNameChange(event, major._id)}
                    onKeyDown={(event) => handleMajorNameKeyDown(event, major._id)}
                    autoFocus
                    onBlur={() => setEditingMajorId(null)}
                    className="bg-gray-100 border border-gray-300 text-ascent-1 bg-secondary rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <>
                    <p className={`${(major.isFacultyDeleted || major.isDeleted) ? 'opacity-25' : ''} truncate w-[180px]`}>{major.majorName}</p>
                    <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 
                      ${selectedMajor?._id === major._id ? '' : 'hidden'} `}>
                      <button className="mr-3" onClick={(event) => {
                        event.stopPropagation();
                        handleEditMajor(major._id);
                      }}>
                        <FaEdit className="" />
                      </button>
                      <button onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteMajor(major._id);
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
            <span className="font-bold">Niên khóa</span>
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
                  placeholder="Thêm niên khóa"
                  name="courseName"
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
          <ul className={`rounded-md mr-3 overflow-y-auto ${showAddCourseForm ? 'h-[80%]' : 'h-[85%]'} `}>
            {filteredCourses.map((course) => (
              <li
                key={course.id}
                onClick={() => {
                  if (editingCourse === null) {
                    handleCourseClick(course);
                  }
                }}
                className={`cursor-pointer hover:bg-gray py-2 px-4 rounded-md relative
                  ${selectedCourse === course ? 'bg-sky text-white' : ''} `}
              >
                {editingCourse === course ? (
                  <input
                    type="text"
                    defaultValue={course}
                    onChange={(event) => handleCourseNameChange(event, course)}
                    onKeyDown={(event) => handleCourseNameKeyDown(event, course)}
                    autoFocus
                    onBlur={() => setEditingCourse(null)}
                    className="bg-gray-100 border border-gray-300 text-ascent-1 bg-secondary rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <>
                    {course}
                    <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 
                      ${selectedCourse === course ? '' : 'hidden'} `}>
                      <button className="mr-3" onClick={(event) => {
                        event.stopPropagation();
                        handleEditCourse(course);
                      }}>
                        <FaEdit className="" />
                      </button>
                      <button onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteCourse(course);
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