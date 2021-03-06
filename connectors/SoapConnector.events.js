import {oncePerServices} from '../services'
import missingService from '../services/missingService'
import {STARTING} from '../services/Service.states'

const SERVICE_TYPE = require('./SoapConnector.serviceType').SERVICE_TYPE;

export default oncePerServices(function defineEvents({bus = missingService('bus')}) {

  bus.alterToString({

    // не выводим сообщение о STARTING, так как выводим OPTIONS.  иначе, не меняем стандартный вывод
    'service.state': ev => ev.serviceType !== SERVICE_TYPE && ev.state === STARTING ? undefined : false,

    // выводим параметры запуска сервиса, с учётом специфики конфигурации это типа сервиса (serviceType)
    'service.settings': ev => ev.serviceType !== SERVICE_TYPE ? false :
      `${ev.service}: connecting to ${ev.settings.uri}${ev.settings.login ? ` as '${ev.settings.login}'` : ''}`,

  });
})
