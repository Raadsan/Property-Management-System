export const PROPERTY_STATUSES = Object.freeze(["CREATED", "AVAILABLE", "BOOKED"]);

const TRANSITIONS_BY_ROLE = Object.freeze({
  ADMIN: { CREATED: ["AVAILABLE"], AVAILABLE: ["BOOKED"], BOOKED: ["AVAILABLE"] },
  SUPER_ADMIN: { CREATED: ["AVAILABLE"], AVAILABLE: ["BOOKED"], BOOKED: ["AVAILABLE"] },
  OWNER: { AVAILABLE: ["BOOKED"], BOOKED: ["AVAILABLE"] },
  AGENT: { AVAILABLE: ["BOOKED"], BOOKED: ["AVAILABLE"] },
});

export function normalizePropertyStatus(status) {
  return typeof status === "string" ? status.trim().toUpperCase() : "";
}

export function authorizePropertyStatusTransition({ roleName, userId, property, newStatus }) {
  const role = roleName?.trim().toUpperCase() ?? "";
  const targetStatus = normalizePropertyStatus(newStatus);
  if (!PROPERTY_STATUSES.includes(targetStatus)) {
    return { allowed: false, statusCode: 400, message: "Invalid property status" };
  }

  if (!(TRANSITIONS_BY_ROLE[role]?.[property.status] ?? []).includes(targetStatus)) {
    const forbiddenApproval = (role === "OWNER" || role === "AGENT") &&
      property.status === "CREATED" && targetStatus === "AVAILABLE";
    return {
      allowed: false,
      statusCode: forbiddenApproval || !TRANSITIONS_BY_ROLE[role] ? 403 : 400,
      message: forbiddenApproval
        ? `${role} users cannot approve a CREATED property`
        : TRANSITIONS_BY_ROLE[role]
        ? `Invalid property status transition: ${property.status} -> ${targetStatus}`
        : "Your role is not authorized to change property status",
    };
  }
  if (role === "OWNER" && property.ownerId !== userId) {
    return { allowed: false, statusCode: 403, message: "You may only change the status of your own property" };
  }
  if (role === "AGENT" && property.agentId !== userId) {
    return { allowed: false, statusCode: 403, message: "You may only change the status of a property assigned to you" };
  }
  return { allowed: true, statusCode: 200, targetStatus };
}
