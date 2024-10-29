import {/* inject, */ BindingScope, injectable} from '@loopback/core';
const fetch = require('node-fetch');

@injectable({scope: BindingScope.TRANSIENT})
export class LogicaNegocioService {
  constructor(/* Add @inject to inject parameters */) {}

  /*
   * Add service methods here
   */
  async crearUsuario(data: any, url: string) {
    try {
      const response = await fetch(url, {
        method: 'post',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'},
      });
      const responseData = await response.json();
      console.log(responseData);
    } catch (error) {
      console.error('Error:', error);
    }
  }

}
