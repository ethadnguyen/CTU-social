const Major = require('../models/major.model');
const { validationResult } = require('express-validator');
const getAllMajors = async (req, res) => {
    try {
        const majors = await Major.find().populate('faculty');
        res.json(majors);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách ngành' });
    }
};

const getMajorById = async (req, res) => {
    try {
        const major = await Major.findById(req.params.id).populate('faculty');
        if (!major) {
            return res.status(404).json({ message: 'Ngành không tồn tại' });
        }
        res.json(major);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy thông tin ngành', error: error.message });
    }
}


const createMajor = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const newMajor = new Major(req.body);
        await newMajor.save();
        res.status(201).json(newMajor);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tạo ngành', error: error.message });
    }
};

const updateMajor = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const updatedMajor = await Major.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedMajor) {
            return res.status(404).json({ message: 'Ngành không tồn tại' });
        }
        res.json(updatedMajor);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật ngành', error: error.message });
    }
};

const deleteMajor = async (req, res) => {
    try {
        const deletedMajor = await Major.findByIdAndDelete(req.params.id);
        if (!deletedMajor) {
            return res.status(404).json({ message: 'Ngành không tồn tại' });
        }
        res.json({ message: 'Ngành đã bị xóa' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa ngành', error: error.message });
    }
};
module.exports = {
    getAllMajors,
    getMajorById,
    createMajor,
    updateMajor,
    deleteMajor
};