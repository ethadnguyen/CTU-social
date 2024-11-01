const Faculty = require('../models/faculty.model');
const User = require('../models/user.model');
const Major = require('../models/major.model');
const Activity = require('../models/activity.model');
const Post = require('../models/post.model');
const GroupRequest = require('../models/groupRequest.model');
const Group = require('../models/group.model');
const { getAllAccountsQuerySchema } = require('../validateSchema/query');
const fs = require('fs');
const util = require('util');
const upload = require('../utils/upload');
const { sendOTP } = require('../utils/sendMail');
const unlinkFile = util.promisify(fs.unlink);


const sendSecurityCode = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Email không tồn tại' });
        }

        await sendOTP(user, res);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Lỗi gửi mã OTP', error: error.message });
    }
};

// Activity controller

const getAllActivities = async (req, res) => {
    try {
        const activities = await Activity.find();
        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách hoạt động' });
    }
};

const getActivity = async (req, res) => {
    const { id } = req.params;
    try {
        const activity = await Activity.findById(id);
        if (!activity) {
            return res.status(404).json({ message: 'Hoạt động không tồn tại' });
        }
        res.json(activity);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy thông tin hoạt động' });
    }
};

const createActivity = async (req, res) => {
    const { title, description, link, image, faculty } = req.body;

    try {
        // const image = req.file ? req.file.path : '';

        const newActivity = new Activity({
            title,
            description,
            image,
            link,
            faculty
        });

        await newActivity.save();

        await Faculty.findByIdAndUpdate(
            faculty,
            { $push: { activities: newActivity._id } },
            { new: true }
        );

        res.status(201).json({
            message: 'Hoạt động đã được tạo',
            activity: newActivity
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Lỗi tạo hoạt động', error: error.message });
    }
}

const updateActivity = async (req, res) => {
    const { activityId } = req.params;
    const { title, description, link, faculty } = req.body;

    try {
        const activity = await Activity.findById(activityId);

        if (!activity) {
            return res.status(404).json({ message: 'Hoạt động không tồn tại' });
        }


        if (req.file) {
            const result = await upload(req.file.path, 'CTU-social/images');
            await unlinkFile(req.file.path); // Xóa file tạm sau khi upload


            activity.image = result.secure_url;
        }


        if (title !== undefined && title !== null) activity.title = title;
        if (description !== undefined && description !== null) activity.description = description;
        if (link !== undefined && link !== null) activity.link = link;
        if (faculty !== undefined && faculty !== null) activity.faculty = faculty;

        const updatedActivity = await activity.save();

        res.status(200).json({
            message: 'Hoạt động đã được cập nhật',
            activity: updatedActivity
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi cập nhật hoạt động', error: error.message });
    }
};

const deleteActivity = async (req, res) => {
    const { activityId } = req.params;
    try {
        const result = await Activity.findByIdAndDelete(activityId);

        if (!result) {
            return res.status(404).json({ message: 'Hoạt động không tồn tại' });
        }

        res.status(200).json({ message: 'Hoạt động đã bị xóa' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Lỗi xóa hoạt động', error: error.message });
    }
}

//Faculty controller

const getAllFaculties = async (req, res) => {
    try {
        const faculties = await Faculty.find().populate('majors').populate('activities');
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
    const { name } = req.body;
    try {
        const existingFaculty = await Faculty.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });
        if (existingFaculty) {
            return res.status(400).json({ message: 'Khoa đã tồn tại' });
        }

        const newFaculty = new Faculty({ name });
        await newFaculty.save();
        res.status(201).json({ message: 'Khoa đã được tạo', faculty: newFaculty });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tạo khoa' });
    }
};

const updateFaculty = async (req, res) => {
    const { facultyId } = req.params;
    const { name } = req.body;
    try {
        const existingFaculty = await Faculty.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            _id: { $ne: facultyId }
        });
        if (existingFaculty) {
            return res.status(400).json({ message: 'Khoa đã tồn tại' });
        }

        const updatedFaculty = await Faculty.findByIdAndUpdate(facultyId, { name }, { new: true });
        if (!updatedFaculty) {
            return res.status(404).json({ message: 'Không tìm thấy khoa' });
        }
        res.json({ message: 'Cập nhật khoa thành công', faculty: updatedFaculty });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật khoa' });
    }
};

const deleteFaculty = async (req, res) => {
    const { facultyId } = req.params;
    try {
        const faculty = await Faculty.findById(facultyId);
        if (!faculty) {
            return res.status(404).json({ message: 'Khoa không tồn tại' });
        }
        await Faculty.findByIdAndUpdate(facultyId, { isDeleted: true }, { new: true });
        await Major.updateMany(
            { faculty: facultyId },
            { isFacultyDeleted: true }
        );

        res.status(200).json({ message: 'Khoa đã đã bị xóa', faculty });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Lỗi xóa khoa', error: error.message });
    }
}

//Major controller

const getAllMajors = async (req, res) => {
    try {
        const majors = await Major.find().populate('faculty');
        res.json(majors);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách ngành' });
    }
};

const getMajorsByFaculty = async (req, res) => {
    const { facultyId } = req.params;

    try {
        const majors = await Major.find({ faculty: facultyId });
        res.json({
            message: 'Lấy danh sách ngành thành công',
            majors
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách ngành' });
    }
}

const getMajor = async (req, res) => {
    try {
        const major = await Major.findById(req.params.id).populate('faculty');
        if (!major) {
            return res.status(404).json({ message: 'Ngành không tồn tại' });
        }
        res.json(major);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy thông tin ngành', error: error.message });
    }
};

const createMajor = async (req, res) => {
    const { facultyId, majorName } = req.body;
    try {
        const existingMajor = await Major.findOne({
            majorName: { $regex: new RegExp(`^${majorName}$`, 'i') },
            faculty: facultyId
        });
        if (existingMajor) {
            return res.status(400).json({ message: 'Ngành đã tồn tại' });
        }

        const newMajor = new Major({
            faculty: facultyId,
            majorName,
        });

        await newMajor.save();
        await Faculty.findByIdAndUpdate(
            facultyId,
            { $push: { majors: newMajor } },
            { new: true }
        );
        res.status(201).json({ message: 'Ngành đã được tạo', major: newMajor });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tạo ngành', error: error.message });
    }
};

const updateMajor = async (req, res) => {
    const { majorId } = req.params;
    const { facultyId, majorName } = req.body;
    try {
        const existingMajor = await Major.findOne({
            majorName: { $regex: new RegExp(`^${majorName}$`, 'i') },
            faculty: facultyId,
            _id: { $ne: majorId }
        });
        if (existingMajor) {
            return res.status(400).json({ message: 'Ngành đã tồn tại' });
        }

        const updatedMajor = await Major.findByIdAndUpdate(majorId, { faculty: facultyId, majorName }, { new: true });
        if (!updatedMajor) {
            return res.status(404).json({ message: 'Ngành không tồn tại' });
        }
        res.json({ message: 'Ngành đã được cập nhật', major: updatedMajor });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật ngành', error: error.message });
    }
};

const deleteMajor = async (req, res) => {
    const { majorId } = req.params;
    try {
        const major = await Major.findById(majorId);
        if (!major) {
            return res.status(404).json({ message: 'Ngành không tồn tại' });
        }

        await Major.findByIdAndUpdate(majorId, { isDeleted: true }, { new: true });

        res.json({ message: 'Ngành đã bị xóa', major });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa ngành', error: error.message });
    }
};

// academicYear management

const addCourse = async (req, res) => {
    const { majorId } = req.params;
    const { course } = req.body;
    try {
        const major = await Major.findById(majorId);
        if (!major) {
            return res.status(404).json({ message: 'Ngành không tồn tại' });
        }

        if (major.academicYear.includes(course)) {
            return res.status(400).json({ message: 'Niên khóa đã tồn tại' });
        }

        major.academicYear.push(course);
        await major.save();
        res.json({
            message: 'Niên khóa đã được thêm',
            major,
            course
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi thêm niên khóa', error: error.message });
    }
};

const updateCourse = async (req, res) => {
    const { majorId } = req.params;
    const { course } = req.body;
    try {
        const major = await Major.findById(majorId);
        if (!major) {
            return res.status(404).json({ message: 'Ngành không tồn tại' });
        }

        if (major.academicYear.includes(course)) {
            return res.status(400).json({ message: 'Niên khóa đã tồn tại' });
        }

        major.academicYear.push(course);
        await major.save();
        res.json({
            message: 'Niên khóa đã được cập nhật',
            major
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật niên khóa', error: error.message });
    }
};

const deleteCourse = async (req, res) => {
    const { majorId } = req.params;
    const { course } = req.query;
    try {
        const major = await Major.findById(majorId);
        if (!major) {
            return res.status(404).json({ message: 'Ngành không tồn tại' });
        }
        if (!major.academicYear.includes(course)) {
            return res.status(400).json({ message: 'Niên khóa không tồn tại' });
        }

        major.academicYear = major.academicYear.filter(item => item !== course);
        await major.save();
        res.json({
            message: 'Niên khóa đã được xóa',
            major,
            course
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa niên khóa', error: error.message });
    }
};

// Account management

const getAllAccounts = async (req, res) => {
    const { facultySlug, majorSlug } = req.query;

    const { error } = getAllAccountsQuerySchema.validate({ facultySlug, majorSlug });

    if (error) {
        return res.status(400).json({ message: 'Tham số không hợp lệ', details: error.details });
    }

    try {
        let query = {};

        if (facultySlug) {
            const faculty = await Faculty.findOne({ slug: facultySlug });
            if (faculty) {
                query.faculty = faculty._id;
            } else {
                return res.status(404).json({ message: 'Faculty không tồn tại' });
            }
        }

        if (majorSlug) {
            const major = await Major.findOne({ slug: majorSlug });
            if (major) {
                query.major = major._id;
            } else {
                return res.status(404).json({ message: 'Major không tồn tại' });
            }
        }

        const accounts = await User.find(query);
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách tài khoản' });
    }
};

const getAccountsByFaculty = async (req, res) => {
    const { facultyId } = req.params;
    try {
        const accounts = await User.find({ faculty: facultyId });
        res.json(accounts);
    }
    catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách tài khoản' });
    }
};

const getAccountsByMajor = async (req, res) => {
    const { majorId } = req.params;
    try {
        const accounts = await User.find({ major: majorId });
        res.json(accounts);
    }
    catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách tài khoản' });
    }
};

const getAccount = async (req, res) => {
    const { id } = req.params;
    try {
        const account = await User.findById(id).populate({
            path: 'faculty major',
            select: 'name majorName academicYear'
        });
        if (!account) {
            return res.status(404).json({ message: 'Tài khoản không tồn tại' });
        }
        res.json(account);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy thông tin tài khoản' });
    }
};

const deleteAccount = async (req, res) => {
    const { id } = req.params;

    try {
        const account = await User.findById(id);
        if (!account) {
            return res.status(404).json({ message: 'Tài khoản không tồn tại' });
        }

        const posts = await Post.find({ user: id });
        let totalReports = 0;
        for (const post of posts) {
            totalReports += post.reports;
        }

        if (totalReports >= 5) {
            await User.findByIdAndDelete(id);
            return res.json({ message: 'Tài khoản đã bị xóa' });
        } else {
            return res.status(403).json({ message: 'Không đủ lượt reports để xóa tài khoản' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa tài khoản' });
    }
};

// Manage request

const getAllGroupRequests = async (req, res) => {
    try {
        const groupRequests = await GroupRequest.find().populate({
            path: 'userId',
            select: 'firstName lastName',
            populate: [
                {
                    path: 'faculty',
                    select: 'name',
                },
                {
                    path: 'major',
                    select: 'majorName academicYear',
                }
            ]
        });
        res.json(groupRequests);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách yêu cầu' });
    }
};

const getGroupRequest = async (req, res) => {
    const { id } = req.params;
    try {
        const groupRequest = await GroupRequest.findById(id).populate({
            path: 'userId',
            select: 'firstName lastName'
        });
        if (!groupRequest) {
            return res.status(404).json({ message: 'Yêu cầu không tồn tại' });
        }

        res.status(200).json(groupRequest);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Lỗi lấy thông tin yêu cầu',
            error: error.message
        });
    }
}

const acceptGroupRequest = async (req, res) => {
    const { requestId, status } = req.body;

    if (status !== 'APPROVED') {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    try {
        const groupRequest = await GroupRequest.findById(requestId);
        if (!groupRequest) {
            return res.status(404).json({ message: 'Yêu cầu không tồn tại' });
        }

        const newGroup = new Group({
            name: groupRequest.name,
            owner: groupRequest.userId,
            admin: [groupRequest.userId],
            members: [groupRequest.userId],
        });

        await newGroup.save();

        groupRequest.status = status;
        await groupRequest.save();

        res.status(201).json({
            message: 'Yêu cầu đã được chấp nhận và nhóm đã được tạo',
            group: newGroup
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi chấp nhận yêu cầu', error: error.message });
    }
};

const rejectGroupRequest = async (req, res) => {
    const { requestId } = req.body;
    try {
        const groupRequest = await GroupRequest.findByIdAndDelete(requestId);

        if (!groupRequest) {
            return res.status(404).json({ message: 'Yêu cầu không tồn tại' });
        }

        res.status(200).json({
            message: 'Yêu cầu tạo nhóm đã bị từ chối',
            groupRequest
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi từ chối yêu cầu', error: error.message });
    }
};

// manage group

const getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find();
        res.status(200).json({
            message: 'Lấy danh sách nhóm thành công',
            groups
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách nhóm' });
    }
};

const getGroup = async (req, res) => {
    const { id } = req.params;
    try {
        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({ message: 'Nhóm không tồn tại' });
        }
        res.status(200).json({
            message: 'Lấy thông tin nhóm thành công',
            group
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy thông tin nhóm', error: error.message });
    }
}

const getGroupByUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const groups = await Group.find({ members: userId });
        res.status(200).json({
            message: 'Lấy danh sách nhóm thành công',
            groups
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách nhóm' });
    }
};

const getGroupByOwner = async (req, res) => {
    const { ownerId } = req.params;
    try {
        const groups = await Group.find({ owner: ownerId });
        res.status(200).json({
            message: 'Lấy danh sách nhóm thành công',
            groups
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách nhóm' });
    }
};

const deleteGroup = async (req, res) => {
    const { id } = req.params;
    try {
        const group = await Group.findByIdAndDelete(id);

        if (!group) {
            return res.status(404).json({ message: 'Nhóm không tồn tại' });
        }

        await User.updateMany(
            { _id: { $in: group.members } },
            { $pull: { groups: id } }
        );

        res.status(200).json({ message: 'Nhóm đã bị xóa' });

    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa nhóm', error: error.message });
    }
};

module.exports = {
    sendSecurityCode,
    getAllActivities,
    getActivity,
    createActivity,
    updateActivity,
    deleteActivity,
    getAllFaculties,
    getFacultyById,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    getAllMajors,
    getMajorsByFaculty,
    getMajor,
    createMajor,
    updateMajor,
    deleteMajor,
    addCourse,
    updateCourse,
    deleteCourse,
    getAllAccounts,
    getAccountsByFaculty,
    getAccountsByMajor,
    getAccount,
    deleteAccount,
    getAllGroupRequests,
    getGroupRequest,
    acceptGroupRequest,
    rejectGroupRequest,
    getAllGroups,
    getGroup,
    getGroupByUser,
    getGroupByOwner,
    deleteGroup,
};