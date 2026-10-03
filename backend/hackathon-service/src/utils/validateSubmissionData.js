import { BadRequestError } from "../errors/BadRequestError.js";

export const validateSubmissionData = (submissionData, submissionForm) => {
  const allowedFields = new Set(submissionForm.map((field) => field.fieldName));

  for (const key of Object.keys(submissionData)) {
    if (!allowedFields.has(key)) {
      throw new BadRequestError(`Unexpected field: ${key}`);
    }
  }

  for (const field of submissionForm) {
    const value = submissionData[field.fieldName];

    if (
      field.required &&
      (value === undefined || value === null || value === "")
    ) {
      throw new BadRequestError(`${field.label} is required`);
    }

    if (field.required && Array.isArray(value) && value.length === 0) {
      throw new BadRequestError(`${field.label} is required`);
    }

    // An optional field left blank (empty text/URL, or no files) is simply
    // "not provided" — it must not be type-checked as if it had content.
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0)
    ) {
      continue;
    }

    switch (field.fieldType) {
      case "TEXT":
      case "TEXTAREA": {
        if (typeof value !== "string") {
          throw new BadRequestError(`${field.label} must be text`);
        }

        break;
      }

      case "URL": {
        if (typeof value !== "string") {
          throw new BadRequestError(`${field.label} must be a URL`);
        }

        try {
          new URL(value);
        } catch {
          throw new BadRequestError(`${field.label} must be a valid URL`);
        }

        break;
      }

      case "DOCUMENT":
      case "IMAGE":
      case "VIDEO": {
        if (typeof value !== "object" || Array.isArray(value)) {
          throw new BadRequestError(`${field.label} is invalid`);
        }

        if (
          !value.url ||
          !value.key ||
          !value.format ||
          value.size === undefined
        ) {
          throw new BadRequestError(`${field.label} is invalid`);
        }

        if (
          field.allowedExtensions?.length &&
          !field.allowedExtensions.includes(value.format?.toLowerCase())
        ) {
          throw new BadRequestError(
            `${field.label} must be one of: ${field.allowedExtensions.join(", ")}`
          );
        }

        break;
      }

      case "MULTI_DOCUMENT":
      case "MULTI_IMAGE":
      case "MULTI_VIDEO": {
        if (!Array.isArray(value)) {
          throw new BadRequestError(`${field.label} must be an array`);
        }

        if (field.maxFiles && value.length > field.maxFiles) {
          throw new BadRequestError(
            `${field.label} exceeds maximum allowed files`
          );
        }

        for (const file of value) {
          if (
            !file.url ||
            !file.key ||
            !file.format ||
            file.size === undefined
          ) {
            throw new BadRequestError(`${field.label} contains invalid files`);
          }

          if (
            field.allowedExtensions?.length &&
            !field.allowedExtensions.includes(file.format?.toLowerCase())
          ) {
            throw new BadRequestError(
              `${field.label} must be one of: ${field.allowedExtensions.join(", ")}`
            );
          }
        }

        break;
      }

      default:
        throw new BadRequestError(`Unsupported field type: ${field.fieldType}`);
    }
  }
};
