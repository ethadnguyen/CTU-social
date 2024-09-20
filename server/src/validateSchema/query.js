const Joi = require('joi');

// Schema để validate query cho getAllAccounts
const getAllAccountsQuerySchema = Joi.object({
    facultySlug: Joi.string().optional().trim(),
    majorSlug: Joi.string().optional().trim(),
});

module.exports = {
    getAllAccountsQuerySchema,
};