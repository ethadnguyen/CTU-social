const Faculty = require('../models/faculty.model');
const Major = require('../models/major.model');

const getAllMajors = async (req, res) => {
    try {
        const majors = await Major.find();
        res.status(200).json(majors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const createMajor = async (req, res) => {
    try {
        const { name, facultyName, academic_year, description } = req.body;

        const faculty = await Faculty.findOne({ name: facultyName });
        if (!faculty) {
            return res.status(404).json({ error: 'Faculty not found' });
        }

        const existingMajor = await Major.findOne({ name, faculty: faculty._id, academic_year });
        if (existingMajor) {
            return res.status(400).json({ error: 'Major already exists for this faculty and academic year' });
        }

        // Tạo mới Major
        const newMajor = new Major({
            name,
            faculty: faculty._id,
            academic_year,
        });

        // Lưu Major vào cơ sở dữ liệu
        const savedMajor = await newMajor.save();

        // Trả về phản hồi thành công
        res.status(201).json({ message: 'Major created successfully', major: savedMajor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllMajors,
    createMajor,
};