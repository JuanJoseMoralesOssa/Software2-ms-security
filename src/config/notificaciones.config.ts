export namespace NotificacionesConfig {
  export const subject2fa: string = "Codigo de verificacion segundo factor";
  export const subjectAuditoria: string = "Asunto de auditoria";
  export const emailVerification: string = "Email Verificacion";
  export const assignedPassword: string = "Contraseña de la cuenta de la aplicacion";
  export const urlNotificationClientRequestEmail: string =
    'https://localhost:5258/Notificaciones/client-request-mail';
  export const urlNotificationCredentialsEmail: string =
    'https://localhost:5258/Notificaciones/credentials-mail';
  export const urlNotifiPasswordRecoveryEmail: string =
    'https://localhost:5258/Notificaciones/password-recovery-mail';
  export const urlNotifications2fa: string =
    'http://localhost:5258/Notificaciones/enviar-correo-2fa';
  export const urlNotificationsSms: string =
    'https://localhost:5258/Notificaciones/send-sms';
  export const urlValidateEmailFrontend: string = "http://localhost:4200/security/validate-public-user-hash";
}
