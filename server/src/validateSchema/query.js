const Joi = require('joi');

const getAllAccountsQuerySchema = Joi.object({
    facultySlug: Joi.string().optional().trim(),
    majorSlug: Joi.string().optional().trim(),
});

module.exports = {
    getAllAccountsQuerySchema,
};