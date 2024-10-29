export namespace SeguridadConfig {
  export const keyJWT = process.env.SECRET_PASSWORD_JWT;
  export const userMenuId: string = '640e0cf85e42613f78309e4c'; // id del usuario menu
  export const rolMenuId: string = '640e0d055e42613f78309e4d'; // id del rol menu
  export const permissionMenuId: string = '6430cfb6f0dcd12f00a9e80d'; // id del los permisos menu
  export const listAction = 'list';
  export const saveAction = 'save';
  export const editAction = 'edit';
  export const deleteAction = 'delete';
  export const downloadAction = 'download';
  export const mongodbConnectionString = process.env.CONNECTION_STRING_MONGODB;
  // export const UserPublicRole = "64519d95a3cbbe48605bc57e";
  // export const recaptchaKeyWebSite = process.env.RecaptchaKeyWebSite;
  // export const recaptchaSecretKey = process.env.RecaptchaSecretKey;
}
