const Notification = require("../models/Notification");
const { emitToUser } = require("../sockets");

/**
 * Creates a Notification document and pushes it to the recipient in realtime over socket.io.
 * @param {Object} params
 * @param {String|ObjectId} params.recipient
 * @param {String} params.type - one of NOTIFICATION_TYPES
 * @param {String} params.title
 * @param {String} params.message
 * @param {Object} [params.meta]
 */
const notify = async ({ recipient, type, title, message, meta = {} }) => {
  const notification = await Notification.create({ recipient, type, title, message, meta });
  emitToUser(recipient, "notification:new", notification);
  return notification;
};

const notifyMany = async (recipients, { type, title, message, meta = {} }) => {
  const docs = await Notification.insertMany(
    recipients.map((recipient) => ({ recipient, type, title, message, meta }))
  );
  docs.forEach((doc) => emitToUser(doc.recipient, "notification:new", doc));
  return docs;
};

module.exports = { notify, notifyMany };
