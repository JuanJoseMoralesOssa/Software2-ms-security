import {injectable, /* inject, */ BindingScope} from '@loopback/core';
const generator = require('generate-password');
const MD5 = require('crypto-js/md5');

@injectable({scope: BindingScope.TRANSIENT})
export class SeguridadUsuarioService {
  constructor(/* Add @inject to inject parameters */) {}

  crearClave(): string {
    let password = generator.generate({
      length: 10,
      numbers: true,
    });
    return password;
  }

  cifrarTexto(cadena: string): string {
    return MD5(cadena).toString();
  }


}
