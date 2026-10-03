import { contactService } from "../services/contactService/contact.service.instance.js";

export const submitContact = async (req, res, next) => {
  try {
    const result = await contactService.submit(req.body, null);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const listEnquiries = async (req, res, next) => {
  try {
    const result = await contactService.list(req.admin._id, req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const updateEnquiry = async (req, res, next) => {
  try {
    const enquiry = await contactService.update(req.admin._id, req.params.enquiryId, req.body);
    return res.status(200).json({ success: true, enquiry });
  } catch (error) {
    next(error);
  }
};

export const submitFeedback = async (req, res, next) => {
  try {
    const result = await contactService.submitFeedback(req.body, null);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
