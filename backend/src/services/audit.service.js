const AuditLog = require('../models/AuditLog');

const getRequestMeta = (req) => ({
  ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
  userAgent: req.get('user-agent') || null,
  requestId: req.id || req.headers['x-request-id'] || null,
});

const createAuditLog = async ({
  actor,
  action,
  entityType,
  entityId,
  description,
  metadata,
  req,
}) => {
  try {
    const requestMeta = req ? getRequestMeta(req) : {};

    await AuditLog.create({
      actor,
      action,
      entityType,
      entityId,
      description,
      metadata: metadata || {},
      ...requestMeta,
    });
  } catch (error) {
    // Audit logging should never block business flow.
    // eslint-disable-next-line no-console
    console.error('Audit log creation failed:', error.message);
  }
};

module.exports = {
  createAuditLog,
};
