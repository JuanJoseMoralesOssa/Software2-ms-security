import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {SeguridadConfig} from '../config/seguridad.config';
import {Credenciales, FactorDeAutenticacionPorCodigo, Usuario} from '../models';
import {LoginRepository, UsuarioRepository} from '../repositories';
const generator = require('generate-password');
const MD5 = require('crypto-js/md5');
const jwt = require('jsonwebtoken');

@injectable({scope: BindingScope.TRANSIENT})
export class SeguridadUsuarioService {
  constructor(
    /* Add @inject to inject parameters */
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
    @repository(LoginRepository)
    public repositorioLogin: LoginRepository
  ) { }

  crearClave(n: number): string {
    let password = generator.generate({
      length: n,
      numbers: true,
      symbols: false,
      lowercase: false,
      uppercase: false,
      excludeSimilarCharacters: true,  // Opcional: evita caracteres similares si el generador lo soporta
      exclude: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" // Excluye letras si es necesario
    });
    return password;
  }


  /**crearCodigo2fa(): string {
    let cadena = '';
    for (let i = 0; i < 4; i++) {
      let numero = Math.floor(Math.random() * 10);
      cadena += numero;
    }
    return cadena;
  }**/

  /**
  * Cifrar una cadena con método md5
  * @param cadena texto a cifrar
  * @returns cadena cifrada con md5
  */
  cifrarTexto(cadena: string): string {
    let cadenaCifrada = MD5(cadena).toString();
    return cadenaCifrada;
  }

  /**
   * Se busca un usuario por sus credenciales de acceso
   * @param credenciales credenciales del usuario
   * @returns usuario encontrado o null
   */
  async identificarUsuario(
    credenciales: Credenciales,
  ): Promise<Usuario | null> {
    let usuario = await this.usuarioRepository.findOne({
      where: {
        correo: credenciales.correo,
        clave: credenciales.clave,
        // hashValidationState: true,
        // accepted: true,
      },
    });
    return usuario as Usuario;
  }

  /**
   * Valida un codigo de 2fa para un usuario
   * @param credenciales2fa credenciales del usuario con el codigo 2 fa
   * @returns el registro del login o null
   */
  async validarCodigo2fa(
    credentials2fa: FactorDeAutenticacionPorCodigo,
  ): Promise<Usuario | null> {
    let login = await this.repositorioLogin.findOne({
      where: {
        usuarioId: credentials2fa.usuarioId,
        codigo2fa: credentials2fa.codigo2fa,
        estadoCodigo2fa: false,
      },
    });
    if (login) {
      let usuario = await this.usuarioRepository.findById(credentials2fa.usuarioId);
      return usuario;
    }
    return null;
  }

  /**
 * Generacion de jwt
 * @param usuario informacion del usuario
 * @returns token
 */
  crearToken(usuario: Usuario): string {
    let data = {
      name: `${usuario.primerNombre} ${usuario.segundoNombre} ${usuario.primerApellido} ${usuario.segundoApellido}`,
      rol: usuario.rolId,
      correo: usuario.correo,
    };
    let token = jwt.sign(data, SeguridadConfig.keyJWT);
    return token;
  }

  /**
   * Valida y obtine el rol de un token
   * @param tk el token
   * @returns el _id del rol
   */
  obtenerRoleDesdeToken(tk: string): string {
    let obj;
    try {
      obj = jwt.verify(tk, SeguridadConfig.keyJWT);
    } catch {
      throw new HttpErrors[401]('Token Invalido');
    }
    return obj.rol;
  }

  /**
   * Retorna los permisos del rol
   * @param idRole id del rol a buscar y que esta asociado al usuario
   */
  // async ConsultarMenuPermisosPorUsuario(idRole: string): Promise<RoleMenu[]> {
  //   let menu: RoleMenu[] = await this.roleMenuRepository.find({
  //     where: {
  //       list: true,
  //       roleId: idRole,
  //     },
  //   });
  //   return menu;
  // }
}
