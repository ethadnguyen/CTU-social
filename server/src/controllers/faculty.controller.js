const Faculty = require('../models/faculty.model');


// Get faculty data
const getFaculties = async (req, res) => {
    try {
        const faculties = await Faculty.find({}, 'name');
        res.status(200).json(faculties);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createFaculty = (req, res) => {
    const { name } = req.body;
    const newFaculty = new Faculty({ name });
    newFaculty.save()
        .then(() => {
            res.status(201).json({ message: 'Faculty created successfully' });
        })
        .catch((error) => {
            res.status(500).json({ error: 'Failed to create faculty' });
        });
};


module.exports = {
    createFaculty,
    getFaculties
};