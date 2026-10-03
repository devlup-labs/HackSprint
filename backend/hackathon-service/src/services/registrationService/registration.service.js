import mongoose from "mongoose";
import { getNowUTC } from "../../utils/dateUtils.js";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { validateRegistrationData } from "../../utils/validateRegistrationData.js";
import { getMissingProfileFields, ProfileIncompleteError } from "../../utils/profileCompleteness.js";

export class RegistrationService {
  constructor(
    registrationRepository,
    userRepository,
    hackathonRepository,
    notificationClient,
    logger
  ) {
    this.registrationRepository = registrationRepository;
    this.userRepository = userRepository;
    this.hackathonRepository = hackathonRepository;
    (this.notificationClient = notificationClient), (this.logger = logger);
  }

  getRegistrationPhase(hackathon, now) {
    const registrationPhase = hackathon.phases?.find(
      (phase) => phase.phaseType === "REGISTRATION" && phase.isActive
    );

    if (!registrationPhase) {
      return null;
    }

    return registrationPhase;
  }

  async registerParticipant({ userId, hackathonId, registrationData }) {
    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      throw new BadRequestError("Invalid event id");
    }

    const user = await this.userRepository.getById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const missingProfileFields = getMissingProfileFields(user);

    if (missingProfileFields.length > 0) {
      throw new ProfileIncompleteError(missingProfileFields);
    }

    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    const existingRegistration =
      await this.registrationRepository.findByUserAndHackathon(
        userId,
        hackathonId
      );

    if (existingRegistration) {
      throw new BadRequestError("User already registered for this event");
    }

    const now = getNowUTC();
    const registrationPhase = this.getRegistrationPhase(hackathon, now);

    if (!registrationPhase) {
      throw new BadRequestError("Registration phase is not configured");
    }

    if (now < registrationPhase.startDate) {
      throw new BadRequestError("Registration has not started yet");
    }

    if (now > registrationPhase.endDate) {
      throw new BadRequestError("Registration is closed");
    }

    this.logger.info(
      {
        userId,
        hackathonId,
      },
      "Registering participant"
    );

    const { name, email, gender, ...customFields } = registrationData;

    validateRegistrationData(customFields, hackathon.registrationForm || []);

    const registrationPayload = {
      ...customFields,

      name: user.name,
      email: user.email,
      gender: user.gender,
    };

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const registration = await this.registrationRepository.create(
        {
          user: userId,
          hackathon: hackathonId,

          formData: registrationPayload,
        },
        session
      );

      await this.hackathonRepository.incrementParticipant(hackathonId, session);

      await session.commitTransaction();

      try {
        await this.notificationClient.createNotification({
          userId,
          title: "Registration Successful",
          message: `You have successfully registered for ${hackathon.title}.`,
          type: "HACKATHON",
          actionUrl: `/hackathons/${hackathon.slug}`,
          metadata: {
            hackathonId: hackathon._id.toString(),
          },
        });

        await this.notificationClient.sendEmail({
          type: "registration-confirmation",
          user: { email: user.email, name: user.name },
          hackathon: {
            hackathonName: hackathon.title,
            hackathonLink: `${process.env.FRONTEND_URL}/hackathon/${hackathon.slug}`,
          },
        });
      } catch (error) {
        this.logger.error(
          { err: error, userId, hackathonId },
          "Failed to create registration notification"
        );
      }

      this.logger.info(
        {
          registrationId: registration._id,
          hackathonId,
        },
        "Participant registered"
      );

      return registration;
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      throw error;
    } finally {
      await session.endSession();
    }
  }

  async isRegistered(userId, hackathonId) {
    const registration =
      await this.registrationRepository.findByUserAndHackathon(
        userId,
        hackathonId
      );

    return {
      isRegistered: !!registration,
      //   registration,
    };
  }

  async getMyRegistration(userId, hackathonId) {
    const registration = await this.registrationRepository.getMyRegistration(
      userId,
      hackathonId
    );

    if (!registration) {
      throw new NotFoundError("Registration not found");
    }

    // Populated in-place so the frontend can render leader/team-member state
    // off this one response instead of a follow-up getTeamById round trip.
    if (registration.team) {
      await registration.populate({
        path: "team",
        select: "name secretCode maxTeamSize leader members",
        populate: [
          { path: "leader", select: "name email" },
          { path: "members", select: "name email" },
        ],
      });
    }

    const user = await this.userRepository.getById(userId);

    return {
      ...registration.toObject(),

      formData: {
        name: user.name,
        email: user.email,
        gender: user.gender,

        ...registration.formData,
      },
    };
  }

  async updateMyRegistration({ userId, hackathonId, registrationData }) {
    const registration = await this.registrationRepository.getMyRegistration(
      userId,
      hackathonId
    );

    if (!registration) {
      throw new NotFoundError("Registration not found");
    }

    const hackathon = await this.hackathonRepository.getById(hackathonId);

    if (!hackathon) {
      throw new NotFoundError("Event not found");
    }

    const now = getNowUTC();

    const registrationPhase = this.getRegistrationPhase(hackathon, now);

    if (!registrationPhase) {
      throw new BadRequestError("Registration phase is not configured");
    }

    if (now < registrationPhase.startDate) {
      throw new BadRequestError("Registration has not started yet");
    }

    if (now > registrationPhase.endDate) {
      throw new BadRequestError("Registration is closed");
    }

    const editableFields = (hackathon.registrationForm || []).filter(
      (field) => field.editable
    );
    const allowedFieldNames = new Set(editableFields.map((field) => field.fieldName));

    const sanitizedUpdate = {};

    const protectedFields = ["name", "email"];

    for (const key of Object.keys(registrationData)) {
      if (protectedFields.includes(key.toLowerCase())) {
        continue;
      }

      if (allowedFieldNames.has(key)) {
        sanitizedUpdate[key] = registrationData[key];
      }
    }

    validateRegistrationData(
      sanitizedUpdate,
      editableFields.filter((field) => sanitizedUpdate[field.fieldName] !== undefined)
    );

    const updatedFormData = {
      ...registration.formData,
      ...sanitizedUpdate,
    };

    return this.registrationRepository.updateRegistration(
      registration._id,
      updatedFormData
    );
  }

  async getMyRegistrations(userId) {
    if (!userId) {
      throw new BadRequestError("User id is required");
    }

    const registrations =
      await this.registrationRepository.findUserRegistrations(userId);

    return registrations;
  }
}
