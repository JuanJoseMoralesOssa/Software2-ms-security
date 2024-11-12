import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {LogicaNegocioConfig} from '../config/logica-negocio.config';
import {NotificacionesConfig} from '../config/notificaciones.config';
import {Credenciales, FactorDeAutenticacionPorCodigo, Login, Usuario} from '../models';
import {
  LoginRepository,
  RolRepository,
  UsuarioRepository,
} from '../repositories';
import {LogicaNegocioService, NotificacionesService, SeguridadUsuarioService} from '../services';

export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
    @repository(RolRepository)
    public rolRepository: RolRepository,
    @repository(LoginRepository)
    public loginRepository: LoginRepository,
    @service(SeguridadUsuarioService)
    public seguridadUsuarioService: SeguridadUsuarioService,
    @service(LogicaNegocioService)
    public logicaNegocioService: LogicaNegocioService,
    @service(NotificacionesService)
    public servicioNotificaciones: NotificacionesService,
  ) { }

  @post('/usuario')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['_id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, '_id'>,
  ): Promise<Usuario> {
    // Crear la clave
    let clave = this.seguridadUsuarioService.crearClave(10);
    console.log(clave);
    // Cifrar la clave
    let claveCifrada = this.seguridadUsuarioService.cifrarTexto(clave);

    if (usuario.clave) {
      claveCifrada = this.seguridadUsuarioService.cifrarTexto(usuario.clave);
    }

    // Asignar la clave al usuario
    usuario.clave = claveCifrada;
    // Enviar un correo electronico de notificacion

    // Guardar en el servicio de logica
    let urlLogicaNegocio =
      LogicaNegocioConfig.urlLogicaNegocio + 'participante';

    let my_usuario = {
      primerNombre: usuario.primerNombre,
      segundoNombre: usuario.segundoNombre,
      primerApellido: usuario.primerApellido,
      segundoApellido: usuario.segundoApellido,
      correo: usuario.correo,
      celular: usuario.celular,
    };

    await this.logicaNegocioService.crearUsuario(my_usuario, urlLogicaNegocio);
    return this.usuarioRepository.create(usuario);
  }

  @get('/usuario/count')
  @response(200, {
    description: 'Usuario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Usuario) where?: Where<Usuario>): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @get('/usuario')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuario')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuario/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuario, {exclude: 'where'})
    filter?: FilterExcludingWhere<Usuario>,
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  @patch('/usuario/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(id, usuario);
  }

  @put('/usuario/{id}')
  @response(204, {
    description: 'Usuario PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.replaceById(id, usuario);
  }

  @del('/usuario/{id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usuarioRepository.deleteById(id);
  }

  @post('/identificar-usuario')
  @response(200, {
    description: 'Identificar un usuario por correo y clave',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async identificarUsuario(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Credenciales),
        },
      },
    })
    credentials: Credenciales,
  ): Promise<object> {
    let user =
      await this.seguridadUsuarioService.identificarUsuario(credentials);
    if (user) {
      let code2fa = this.seguridadUsuarioService.crearClave(4);
      console.log(code2fa);
      let login: Login = new Login();
      login.usuarioId = user._id!; // Este dato _id si o si va a llegar
      login.codigo2fa = code2fa;
      login.estadoCodigo2fa = false;
      login.token = '';
      login.estadoToken = false;
      this.loginRepository.create(login);
      user.clave = '';
      let datos = {
        correoDestino: user.correo,
        nombreDestino: user.primerNombre+" "+user.primerApellido,
        contenidoCorreo:'Su codigo de segundo factor de autenticacion es: '+code2fa,
        asuntoCorreo: NotificacionesConfig.subject2fa
      };
      let url = NotificacionesConfig.urlNotifications2fa;
      this.servicioNotificaciones.EnviarNotificacion(datos, url);
      console.log(code2fa);
      return user;
    }
    return new HttpErrors[401]('Credenciales incorrectas. ');
  }

  @post('/verificar-2FA')
  @response(200, {
    description: 'Validar un codigo de 2FA',
  })
  async VerificarCodigo2fa(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(FactorDeAutenticacionPorCodigo),
        },
      },
    })
    credentials: FactorDeAutenticacionPorCodigo,
  ): Promise<object> {
    let usuario = await this.seguridadUsuarioService.validarCodigo2fa(credentials);
    if (usuario) {
      let token = this.seguridadUsuarioService.crearToken(usuario);
      if (usuario) {
        usuario.clave = "";
        try {
          this.usuarioRepository.logins(usuario._id).patch(
            {
              estadoCodigo2fa: true,
              token: token
            },
            {
              estadoCodigo2fa: false
            });
        } catch {
          console.log("No se ha almacenado el cambio del estado de token en la base de datos.")
        }
        return {
          user: usuario,
          token: token,
        };
      }
    }
    return new HttpErrors[401]("Código de 2fa inválido para el usuario definido.");
  }
}
