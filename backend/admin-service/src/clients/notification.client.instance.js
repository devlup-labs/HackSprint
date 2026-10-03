import { logger }
  from "../utils/logger.js";

import { NotificationClient }
  from "./notification.client.js";

export const notificationClient =
  new NotificationClient(
    logger
  );