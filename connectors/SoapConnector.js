import * as fs from 'fs'
import path from 'path'

import {
  validateAndCopyOptionsFactory,
  VType,
} from '../validation'

import prettyPrint from '../utils/prettyPrint'
import {missingArgument, invalidArgument} from '../utils/arguments'

import ensureDir from 'ensure-dir'

import urlApi from 'url'
import soap from 'soap'
import SoapErrorException from '../errors/SoapErrorException'

const debug = require('debug')('soap');

const validateOptions = validateAndCopyOptionsFactory({
  description: {type: VType.String()},
  uri: {type: VType.String().notEmpty(), required: true/*, copy: true*/},
  login: {type: VType.String().notEmpty(), required: true/*, copy: true*/},
  password: {type: VType.String().notEmpty(), required: true, copy: true},
});

export function config(services) {
  // nothing
}

const SERVICE_TYPE = require('./PGConnector.serviceType').SERVICE_TYPE;

export default function (services) {

  const {bus = throwIfMissing('bus')} = services;

  class Soap {

    constructor(options) {
      debug('ctor: %O', arguments);
      validateOptions(options, {argument: 'options', copyTo: this});
      this._options = options;
      // TODO:  Привести к общему виду.  При переходе с задачи интеграции с 1С на интеграцию с МТС Connect, url -> uri, user -> login
      this._url = options.uri;
      this._user = options.login;
    }

    _addMethods() {

      let client = this._connection;

      let desc = client.describe();
      let methods = null;

      for (const serviceName of Object.getOwnPropertyNames(desc)) { // обрабатываем только первое описание - пока примеров нескольких описаний не было
        debug('service name: %s', serviceName);
        let service = desc[serviceName];
        for (const portName of Object.getOwnPropertyNames(service)) {
          debug('port name: %s', portName);
          if (portName.endsWith('12')) {
            methods = service[portName];
            break;
          }
        }
        break;
      }

      const url = this._url;
      for (const methodName of Object.getOwnPropertyNames(methods)) {
        debug('method: %s', methodName);
        let methodDesc = methods[methodName];
        this[methodName] = function (args) {
          debug('method: %s; args: %j', methodName, args);
          return new Promise(function (resolve, reject) {
            client[methodName](args, function (err, result) {
              if (err) reject(new SoapErrorException({url, action: methodName, err}));
              else resolve(result);
            })
          });
        }
      }
    }

    async _serviceStart() {
      const optsWithoutPassword = {...this._options};
      delete optsWithoutPassword.password;
      bus.info({
        time: new Date().getTime(),
        type: 'service.options',
        source: this._service.get('name'),
        serviceType: SERVICE_TYPE,
        options: optsWithoutPassword,
      });
      return new Promise((resolve, reject) => {
        let urlObject = urlApi.parse(this._url);
        if (this._user) urlObject.auth = `${this._user}:${this._password}`;
        soap.createClient(`${urlApi.format(urlObject)}?wsdl`, (err, client) => {
          if (err) {
            debug('client creation failed %O', err);
            reject(new SoapErrorException({url: this._url, method: 'createClient', err}));
          } else {
            debug(`client creation succeeded`);
            if (this._user) client.setSecurity(new soap.BasicAuthSecurity(this._user, this._password));
            this._connection = client;
            this._addMethods();
            resolve();
          }
        });
      });
    }

    async _serviceStop() {
      soap.reset();
    }

    async saveDescription(filename = throwIfMissing('filename')) {
      if (!this.hasOwnProperty('_client')) throw Error('Not initialized');
      let filenameNormolized = path.resolve(process.cwd(), filename);
      ensureDir(path.dirname(filenameNormolized));
      await Promise.promisify(fs.writeFile)(filenameNormolized, JSON.stringify(this._connection.describe(), null, 2));
    }
  }

  Soap.SERVICE_TYPE = SERVICE_TYPE;

  return Soap;
}
