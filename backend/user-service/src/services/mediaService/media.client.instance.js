import { logger } from "../../utils/logger.js";
import { MediaServiceClient } from "./media.client.js";

export const mediaServiceClient =
  new MediaServiceClient(logger);