import { BadRequestError } from "../../errors/BadRequestError.js";
import { ForbiddenError } from "../../errors/ForbiddenError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { validateVerificationSubmission } from "../../utils/organizerVerification.js";

export class AdminService {
  constructor(adminRepository, logger, notificationClient) {
    this.adminRepository = adminRepository;

    this.logger = logger;

    this.notificationClient = notificationClient;
  }

  async getProfile(adminId) {
    const admin = await this.adminRepository.getById(adminId);

    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    return admin;
  }

  // Open to any authenticated admin (not controller-gated) — organizers need
  // this to look up a fellow admin by email before assigning them as a judge.
  async lookupAdminByEmail(email) {
    if (!email) {
      throw new BadRequestError("Email is required");
    }

    const admin = await this.adminRepository.getByEmail(
      email.toLowerCase().trim()
    );

    if (!admin) {
      throw new NotFoundError("No admin found with that email");
    }

    return {
      _id: admin._id,
      adminName: admin.adminName,
      email: admin.email,
      avatar: admin.avatar,
      organizationName: admin.organizationName,
    };
  }

  async updateProfile(adminId, payload) {
    const admin = await this.adminRepository.getById(adminId);

    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    const {
      organizationName,
      organizerType,
      contactNumber,
      country,
      website,
      linkedin,
      bio,
      avatar,
    } = payload;

    if (!organizationName || !contactNumber || !country) {
      throw new BadRequestError(
        "organizationName, contactNumber and country are required"
      );
    }

    const updatedAdmin = await this.adminRepository.updateProfile(adminId, {
      organizationName,
      organizerType,
      contactNumber,
      country,
      website,
      linkedin,
      bio,
      avatar,

      profileCompleted: true,
    });

    return updatedAdmin;
  }

  async submitVerificationRequest(adminId, payload) {
    const admin = await this.adminRepository.getById(adminId);

    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    if (admin.controller) {
      throw new BadRequestError("Platform controllers don't need verification");
    }

    if (!admin.profileCompleted) {
      throw new ForbiddenError("Complete profile first");
    }

    if (admin.verificationStatus === "PENDING") {
      throw new BadRequestError("Verification request already submitted");
    }

    // Organisers verified before documents were collected have to submit
    // them too; only those who already have a full file on record are done.
    if (admin.verificationStatus === "APPROVED" && admin.verificationDocuments?.length > 0) {
      throw new BadRequestError("You're already verified");
    }

    const { details, documents } = validateVerificationSubmission(
      admin.organizerType,
      payload
    );

    admin.verificationDetails = details;
    admin.verificationDocuments = documents;
    // Keep the single-document field populated for older consumers.
    admin.verificationDocument = { url: documents[0].url, key: documents[0].key };
    admin.verificationSubmittedAt = new Date();
    admin.verificationRemarks = "";
    admin.verificationStatus = "PENDING";

    await this.adminRepository.save(admin);

    const controllers = await this.adminRepository.getControllers();
    await Promise.all(
      controllers.map((c) =>
        this.notificationClient.createNotification({
          userId: c._id,
          title: "Organizer verification request",
          message: `${admin.organizationName || admin.adminName} submitted their details and documents for verification.`,
          type: "SYSTEM",
          actionUrl: "/admin",
        })
      )
    );

    return {
      success: true,
      message: "Verification request submitted",
    };
  }

  async ensureVerifiedOrganizer(adminId) {
    const admin = await this.adminRepository.getById(adminId);

    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    // Platform controllers run the verification, so they're exempt from it.
    if (admin.controller) {
      return admin;
    }

    if (!admin.profileCompleted) {
      throw new ForbiddenError("Complete your profile first");
    }

    if (!admin.isVerified || !admin.verificationDocuments?.length) {
      throw new ForbiddenError("Organizer verification required");
    }

    return admin;
  }

  async getPendingVerificationRequests(controllerId) {
    const controller = await this.adminRepository.getById(controllerId);

    if (!controller || !controller.controller) {
      throw new ForbiddenError("Unauthorized");
    }

    return this.adminRepository.getPendingVerificationRequests();
  }

  async getAllAdmins(controllerId) {
    const controller = await this.adminRepository.getById(controllerId);

    if (!controller || !controller.controller) {
      throw new ForbiddenError("Unauthorized");
    }

    return this.adminRepository.getAllAdmins();
  }

  async deleteAdmin(controllerId, adminId) {
    const controller = await this.adminRepository.getById(controllerId);

    if (!controller || !controller.controller) {
      throw new ForbiddenError("Unauthorized");
    }

    if (adminId.toString() === controllerId.toString()) {
      throw new ForbiddenError("You cannot delete your own account");
    }

    const target = await this.adminRepository.getById(adminId);

    if (!target) {
      throw new NotFoundError("Admin not found");
    }

    if (target.controller) {
      throw new ForbiddenError("Controller accounts cannot be deleted");
    }

    await this.adminRepository.deleteById(adminId);

    this.logger.info(
      {
        controllerId,
        deletedAdminId: adminId,
      },
      "Admin account deleted"
    );

    return {
      success: true,
      message: "Admin deleted",
    };
  }

  async approveVerification({ controllerId, adminId }) {
    const controller = await this.adminRepository.getById(controllerId);

    if (!controller || !controller.controller) {
      throw new ForbiddenError("Unauthorized");
    }

    const admin = await this.adminRepository.getById(adminId);

    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    if (admin.verificationStatus !== "PENDING") {
      throw new BadRequestError("No pending verification request");
    }

    const updated = await this.adminRepository.updateVerificationStatus(adminId, {
      isVerified: true,

      verificationStatus: "APPROVED",

      verifiedAt: new Date(),

      verifiedBy: controllerId,
    });

    await this.notificationClient.createNotification({
      userId: adminId,
      title: "Verification Approved",
      message: "Your organizer verification has been approved. You can now create events.",
      type: "SYSTEM",
      actionUrl: "/admin",
    });

    return updated;
  }

  async rejectVerification({ controllerId, adminId, remarks }) {
    const controller = await this.adminRepository.getById(controllerId);

    if (!controller || !controller.controller) {
      throw new ForbiddenError("Unauthorized");
    }

    const admin = await this.adminRepository.getById(adminId);

    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    if (admin.verificationStatus !== "PENDING") {
      throw new BadRequestError("No pending verification request");
    }

    const updated = await this.adminRepository.updateVerificationStatus(adminId, {
      isVerified: false,

      verificationStatus: "REJECTED",

      verificationRemarks: remarks || "",

      verifiedAt: null,

      verifiedBy: null,
    });

    await this.notificationClient.createNotification({
      userId: adminId,
      title: "Verification Rejected",
      message: remarks
        ? `Your organizer verification was rejected: ${remarks}`
        : "Your organizer verification was rejected.",
      type: "SYSTEM",
      actionUrl: "/admin",
    });

    return updated;
  }
}
