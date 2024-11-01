const Faculty = require('../models/faculty.model');

const getFaculties = async (req, res) => {
    try {
        const faculties = await Faculty.find({ isDeleted: false }).populate('majors').populate('activities');
        res.status(200).json(faculties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getFaculty = async (req, res) => {
    const { facultyId } = req.params;
    try {
        const faculty = await Faculty.findById(facultyId).populate('activities');
        if (!faculty) {
            return res.status(404).json({ message: 'Khoa không tồn tại' });
        }
        res.status(200).json(faculty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMajors = async (req, res) => {
    const { facultyId } = req.params;
    try {
        const faculty = await Faculty.findById(facultyId).populate({
            path: 'majors',
            match: { $or: [{ isFacultyDeleted: false }, { isDeleted: false }] }
        });
        if (!faculty) {
            return res.status(404).json({ message: 'Khoa không tồn tại' });
        }
        res.status(200).json(faculty.majors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getFaculties,
    getFaculty,
    getMajors
};