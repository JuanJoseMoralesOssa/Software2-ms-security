import { /* inject, */ BindingScope, injectable} from '@loopback/core';
const fetch = require('node-fetch');
const axios = require('axios');

@injectable({scope: BindingScope.TRANSIENT})
export class NotificacionesService {
  constructor(/* Add @inject to inject parameters */) {}

  /*
   * Add service methods here
   */

  async EnviarNotificacion(datos: any, url: string): Promise<boolean> {
    try {
      await axios.post(url, datos, {
        headers: {'Content-Type': 'application/json'},
      });
      console.log("Mensaje enviado con exito")
      return true;
    } catch (error) {
      console.error(`Error al enviar notificación: ${error.message}`);
      return false;
    }
  }
}
