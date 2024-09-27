import { faculties } from "../assets/register";

export const getFaculties = () => {
  return faculties;
};

export const getMajors = () => {
  return faculties.flatMap((faculty) => faculty.majors);
};

export const getMajorsByFacultyId = (facultyId) => {
  const faculty = faculties.find((f) => f.id === facultyId);
  return faculty ? faculty.majors : [];
};

export const getCoursesByMajorId = (majorId) => {
  for (const faculty of faculties) {
    const major = faculty.majors.find((m) => m.id === majorId);
    if (major) {
      return major.courses;
    }
  }
  return [];
};

export const getCoursesByFacultyId = (facultyId) => {
  const faculty = faculties.find((f) => f.id === facultyId);
  return faculty ? faculty.majors.flatMap((major) => major.courses) : [];
};