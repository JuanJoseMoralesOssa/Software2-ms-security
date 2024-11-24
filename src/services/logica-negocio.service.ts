import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {LogicaNegocioConfig} from '../config/logica-negocio.config';
const fetch = require('node-fetch');
const axios = require('axios');
const LOGIC_URL = LogicaNegocioConfig.urlLogicaNegocio;

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

  async getOrganizadorIdporCorreo(correo: string): Promise<number | null> {
    try {
      const response = await axios.get(
        LOGIC_URL +
          `organizador?filter={"fields":["id"], "where": {"correo": "${correo}"}}`,
        {
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
        },
      );
      if (response.data.length === 0) {
        return null;
      }
      return response.data[0].id;
    } catch (error) {
      console.error('Error getting organizer:', error);
      throw error;
    }
  }

  async deleteOrganizador(organizadorId: number): Promise<void> {
    try {
      const response = await axios.delete(
        LOGIC_URL + `organizador/${organizadorId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
}
