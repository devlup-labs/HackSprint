import axios from "axios";

export class MediaServiceClient {
  constructor(logger) {
    this.logger = logger;
    this.baseUrl = process.env.MEDIA_SERVICE_URL;
  }

  async deleteFile(key) {
    try {
      await axios.delete(`${this.baseUrl}/`, {
        data: {
          key,
        },
        headers: {
          "x-service-secret": process.env.INTERNAL_SERVICE_SECRET,
        },
      });
    } catch (error) {
      this.logger.error(
        {
          err: error,
          key,
        },
        "Failed to delete file from media service"
      );

      throw error;
    }
  }
}
