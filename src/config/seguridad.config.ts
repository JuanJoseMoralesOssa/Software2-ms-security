export namespace SeguridadConfig {
  export const keyJWT = process.env.SECRET_PASSWORD_JWT;
  export const userMenuId: string = '6707fc2a82f9cb570086f431'; // id del usuario menu
  export const rolMenuId: string = '6707fc7082f9cb570086f432'; // id del rol menu
  export const permissionMenuId: string = '67229ec4344bc057986f9f39'; // id del los permisos menu
  export const listAction = 'list';
  export const saveAction = 'save';
  export const editAction = 'edit';
  export const deleteAction = 'delete';
  export const downloadAction = 'download';
  export const mongodbConnectionString = process.env.CONNECTION_STRING_MONGODB;
  export const userPublicRole = '67229d08344bc057986f9f35';
  // export const recaptchaKeyWebSite = process.env.RecaptchaKeyWebSite;
  // export const recaptchaSecretKey = process.env.RecaptchaSecretKey;
}
