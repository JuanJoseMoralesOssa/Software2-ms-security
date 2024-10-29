export namespace NotificacionesConfig {
  export const subject2fa: string = "Codigo de verificacion";
  export const subjectAuditoria: string = "Asunto de auditoria";
  export const emailVerification: string = "Email Verificacion";
  export const assignedPassword: string = "Contraseña de la cuenta de akinmueble";
  export const urlNotificationClientRequestEmail: string = "https://localhost:7276/Notification/client-request-mail";
  export const urlNotificationCredentialsEmail: string = "https://localhost:7276/Notification/credentials-mail";
  export const urlNotifiPasswordRecoveryEmail: string = "https://localhost:7276/Notification/password-recovery-mail";
  export const urlNotifications2fa: string = "https://localhost:7276/Notification/send-mail-2fa";
  export const urlNotificationsSms: string = "https://localhost:7276/Notification/send-sms";
  export const urlValidateEmailFrontend: string = "http://localhost:4200/security/validate-public-user-hash";
}
