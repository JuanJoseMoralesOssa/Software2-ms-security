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
import {Credenciales, Login, Usuario} from '../models';
import {
  LoginRepository,
  RolRepository,
  UsuarioRepository,
} from '../repositories';
import {LogicaNegocioService, SeguridadUsuarioService} from '../services';

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
  ) {}

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
    // Asignar la clave al usuario
    usuario.clave = claveCifrada;
    // Enviar un correo electronico de notificacion

    // Guardar en el servicio de logica
    // let urlLogicaNegocio =
    //   LogicaNegocioConfig.urlLogicaNegocio + 'participante';

    // let my_usuario = {
    //   primerNombre: usuario.primerNombre,
    //   segundoNombre: usuario.segundoNombre,
    //   primerApellido: usuario.primerApellido,
    //   segundoApellido: usuario.segundoApellido,
    //   correo: usuario.correo,
    //   celular: usuario.celular,
    // };

    // await this.logicaNegocioService.crearUsuario(my_usuario, urlLogicaNegocio);
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
    content: {'application/json': {schema: getModelSchemaRef(Credenciales)}},
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
      let code2fa = this.seguridadUsuarioService.crearCodigo2fa();
      console.log(code2fa);
      let login: Login = new Login();
      login.usuarioId = user._id!; // Este dato _id si o si va a llegar
      login.codigo2fa = code2fa;
      login.estadoCodigo2fa = false;
      login.token = '';
      login.estadoToken = false;
      this.loginRepository.create(login);
      user.clave = '';
      // notificar al usuario via correo o sms
      // let data = {
      //   destinationMail: user.email,
      //   destinationName: user.firstName + ' ' + user.secondName,
      //   mailContent: `${code2fa}`,
      //   emailSubject: NotificationsConfiguration.subject2fa,
      // };
      // let url = NotificationsConfiguration.urlNotifications2fa;
      // console.log(url);
      console.log(code2fa);
      return user;
    }
    return new HttpErrors[401]('Credenciales incorrectas. ');
  }
}