import { platformUserService } from "../services/platformUserService/platformUser.service.instance.js";
import { adminService } from "../services/adminService/admin.service.instance.js";

export const getProfile = async (req, res, next) => {
  try {
    const admin = await adminService.getProfile(req.admin._id);

    return res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const admin = await adminService.updateProfile(req.admin._id, req.body);

    return res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    next(error);
  }
};

export const submitVerificationRequest = async (req, res, next) => {
  try {
    const result = await adminService.submitVerificationRequest(
      req.admin._id,
      req.body
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPendingVerificationRequests = async (req, res, next) => {
  try {
    const requests = await adminService.getPendingVerificationRequests(
      req.admin._id
    );

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await adminService.getAllAdmins(req.admin._id);

    return res.status(200).json({
      success: true,
      admins,
    });
  } catch (error) {
    next(error);
  }
};

export const lookupAdminByEmail = async (req, res, next) => {
  try {
    const admin = await adminService.lookupAdminByEmail(req.query.email);

    return res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdmin = async (req, res, next) => {
  try {
    const result = await adminService.deleteAdmin(
      req.admin._id,
      req.params.adminId
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const approveVerification = async (req, res, next) => {
  try {
    const admin = await adminService.approveVerification({
      controllerId: req.admin._id,
      adminId: req.params.adminId,
    });

    return res.status(200).json({
      success: true,
      message: "Verification approved",
      admin,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectVerification = async (req, res, next) => {
  try {
    const admin = await adminService.rejectVerification({
      controllerId: req.admin._id,

      adminId: req.params.adminId,

      remarks: req.body.remarks,
    });

    return res.status(200).json({
      success: true,
      message: "Verification rejected",
      admin,
    });
  } catch (error) {
    next(error);
  }
};

export const searchPlatformUsers = async (req, res, next) => {
  try {
    const result = await platformUserService.searchUsers(req.admin._id, req.query);

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const deletePlatformUser = async (req, res, next) => {
  try {
    const result = await platformUserService.deleteUser(req.admin._id, req.params.userId, req.body);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
