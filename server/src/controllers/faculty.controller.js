const Faculty = require('../models/faculty.model');
const { body, validationResult } = require('express-validator');

const getAllFaculties = async (req, res) => {
    try {
        const faculties = await Faculty.find();
        res.json(faculties);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách khoa' });
    }
};

const getFacultyById = async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) {
            return res.status(404).json({ message: 'Không tìm thấy khoa' });
        }
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy thông tin khoa' });
    }
}

const createFaculty = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const newFaculty = new Faculty(req.body);
        await newFaculty.save();
        res.status(201).json(newFaculty);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tạo khoa' });
    }
};

const updateFaculty = async (req, res) => {
    try {
        const errors = validateResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const updatedFaculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedFaculty) {
            return res.status(404).json({ message: 'Không tìm thấy khoa' });
        }
        res.json(updatedFaculty);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật khoa' });
    }
};

const deleteFaculty = async (req, res) => {
    try {
        const deletedFaculty = await Faculty.findByIdAndDelete(req.params.id);
        if (!deletedFaculty) {
            return res.status(404).json({ message: 'Khoa không tồn tại' });
        }
        res.json({ message: 'Khoa đã bị xóa' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa khoa' });
    }
}


module.exports = {
    getAllFaculties,
    getFacultyById,
    createFaculty,
    updateFaculty,
    deleteFaculty
};