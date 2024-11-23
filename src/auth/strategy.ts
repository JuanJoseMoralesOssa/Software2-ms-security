import {
  AuthenticationBindings,
  AuthenticationMetadata,
  AuthenticationStrategy,
} from '@loopback/authentication';
import {inject, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import parseBearerToken from 'parse-bearer-token';
import {RolMenuRepository} from '../repositories';
import {SeguridadUsuarioService} from '../services';

export class AuthStrategy implements AuthenticationStrategy {
  name: string = 'auth';

  constructor(
    @service(SeguridadUsuarioService)
    private servicioSeguridad: SeguridadUsuarioService,
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata,
    @repository(RolMenuRepository)
    private repositorioRolMenu: RolMenuRepository,
  ) {}


  /**
   * Autenticacion de un usuario frente a una accion en la bd
   * @param request la solicitud con el token
   * @returns el perfil del usuario, undefined cunado no tiene permiso o un http error
   */
  async authenticate(request: Request): Promise<UserProfile | undefined> {
    console.log('ejecutar');
    let token = parseBearerToken(request);
    if (token) {
      let idRol = this.servicioSeguridad.obtenerRoleDesdeToken(token);
      let idMenu: string = this.metadata.options![0];
      let accion: string = this.metadata.options![1];

      // buscar si el permiso esta activo para ejecutar esa accion de ese menu con el rol definido
      let permiso = await this.repositorioRolMenu.findOne({
        where: {
          rolId: idRol,
          menuId: idMenu,
        },
      });
      let continuar: boolean = false;
      if (permiso) {
        switch (accion) {
          case 'listar':
            continuar = permiso.listar;
            break;

          case 'guardar':
            continuar = permiso.guardar;
            break;

          case 'editar':
            continuar = permiso.editar;
            break;

          case 'eliminar':
            continuar = permiso.eliminar;
            break;

          case 'descargar':
            continuar = permiso.descargar;
            break;

          default:
            throw new HttpErrors[401](
              'No es posible ejecutar la accion porque no existe',
            );
        }
        if (continuar) {
          let perfil: UserProfile = Object.assign({
            rolId: idRol,
            permitido: 'OK',
          });
          return perfil;
        } else {
          return undefined;
        }
      } else {
        throw new HttpErrors[401](
          'No tiene permisos para acceder a este recurso',
        );
      }
    }
    throw new HttpErrors[401]('No tiene un token valido');
  }
}
