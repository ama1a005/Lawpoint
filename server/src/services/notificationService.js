require('dotenv').config();
const nodemailer = require('nodemailer');

// ── Transporter ────────────────────────────────────────────────────────────
let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[notificationService] SMTP credentials not configured — emails will be logged only.');
    return null;
  }

  _transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587', 10),
    secure: SMTP_PORT === '465',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return _transporter;
};

// ── Email ──────────────────────────────────────────────────────────────────
/**
 * Send an email. Falls back to console.log if SMTP is not configured.
 * @param {string} to
 * @param {string} subject
 * @param {string} text - Plain text body
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
const sendEmail = async (to, subject, text) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[notificationService] EMAIL (stub) → to: ${to} | subject: ${subject}`);
    return { success: true, messageId: 'stub-no-smtp' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"LawPoint" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });
    console.log(`[notificationService] Email sent → ${to} | messageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[notificationService] Email failed → ${to}:`, err.message);
    return { success: false, error: err.message };
  }
};

// ── SMS (Twilio stub — Week 3 extension) ──────────────────────────────────
/**
 * Send an SMS via Twilio. Logs if Twilio is not configured.
 * @param {string} to - E.164 format (e.g. +91xxxxxxxxxx)
 * @param {string} message
 */
const sendSMS = async (to, message) => {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE) {
    console.log(`[notificationService] SMS (stub) → to: ${to} | message: ${message}`);
    return { success: true, sid: 'stub-no-twilio' };
  }

  // Dynamic require so server starts cleanly even without twilio installed
  try {
    const twilio = require('twilio');
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    const msg = await client.messages.create({ body: message, from: TWILIO_PHONE, to });
    return { success: true, sid: msg.sid };
  } catch (err) {
    console.error(`[notificationService] SMS failed → ${to}:`, err.message);
    return { success: false, error: err.message };
  }
};

// ── Domain helpers ─────────────────────────────────────────────────────────

/**
 * Notify accused party on case approval.
 * Only the case reference number is sent — never the complaint text.
 */
const notifyAccused = (contact, caseId) =>
  sendEmail(
    contact,
    'Court Case Notification — LawPoint',
    `You have been named in a legal case filed through LawPoint.\n\nCase Reference: ${caseId}\n\nPlease contact the relevant court for further details.\n\n— LawPoint Case Management System`,
  );

/**
 * Notify citizen that their case was rejected.
 */
const notifyCitizenRejection = (email, caseId, rejectionNote) =>
  sendEmail(
    email,
    'Case Update: Complaint Rejected — LawPoint',
    `Your complaint (Case ID: ${caseId}) has been reviewed and rejected.\n\nReason: ${rejectionNote || 'No reason provided.'}\n\nYou may file a new complaint with additional details.\n\n— LawPoint`,
  );

/**
 * Notify citizen that their lawyer request was accepted.
 */
const notifyCitizenLawyerAccepted = (email, caseId, lawyerName) =>
  sendEmail(
    email,
    'Lawyer Request Accepted — LawPoint',
    `Your lawyer request for Case ${caseId} has been accepted by ${lawyerName}.\n\nYour case is now active. You can track progress on your dashboard.\n\n— LawPoint`,
  );

/**
 * Notify citizen that their lawyer request was declined.
 */
const notifyCitizenLawyerDeclined = (email, caseId) =>
  sendEmail(
    email,
    'Lawyer Request Declined — LawPoint',
    `Your lawyer request for Case ${caseId} was declined.\n\nPlease log in to select another available lawyer.\n\n— LawPoint`,
  );

/**
 * Notify a party about a scheduled hearing.
 */
const notifyHearingScheduled = (email, caseId, scheduledDate) =>
  sendEmail(
    email,
    'Hearing Scheduled — LawPoint',
    `A hearing has been scheduled for Case ${caseId}.\n\nDate: ${new Date(scheduledDate).toDateString()}\n\nPlease log in to your LawPoint dashboard for full details.\n\n— LawPoint`,
  );

module.exports = {
  sendEmail,
  sendSMS,
  notifyAccused,
  notifyCitizenRejection,
  notifyCitizenLawyerAccepted,
  notifyCitizenLawyerDeclined,
  notifyHearingScheduled,
};
