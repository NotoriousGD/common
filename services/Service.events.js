import missingService from './missingService'
import prettyPrint from '../utils/prettyPrint'
import oncePerServices from './oncePerServices'

import {VType, validateEventFactory, BaseEvent} from '../events'

import {NOT_INITIALIZED, WAITING_OTHER_SERVICES_TO_START_OR_FAIL, INITIALIZING} from './Service.states'

export default oncePerServices(function defineEvents({bus = missingService('bus'), testMode}) {

  bus.registerEvent([
      // service.state
      {
        kind: 'event',
        type: 'service.state',
        validate: validateEventFactory({
          _extends: BaseEvent,
          state: {type: VType.String().notEmpty(), required: true},
          prevState: {type: VType.String().notEmpty(), required: true},
          serviceType: {type: VType.String().notEmpty()},
          reason: {fields: require('../errors/error.schema').errorSchema}, // причина перехода в состояние FAILED - поле message из Error
        }),
        toString: (ev) => {
          // Чтобы не сбивать с толку, при начальном запуске не выводим сообщение что сервис перешел в состояние stopped
          if (ev.prevState === NOT_INITIALIZED || ev.prevState === WAITING_OTHER_SERVICES_TO_START_OR_FAIL || ev.prevState === INITIALIZING) return;
          return `${ev.source}: state: '${ev.state}'${ev.reason ? ` (reason: '${ev.reason.message}')` : ``}`
        },
      },
      // service.error
      {
        kind: 'error',
        type: 'service.error',
        validate: validateEventFactory(Object.assign({
            _extends: BaseEvent,
            serviceType: {type: VType.String().notEmpty()},
          },
          require('../errors/error.schema').errorSchema)
        ),
        toString: (ev) =>
          testMode ? `${ev.source}: error: '${ev.message}'` : // для testMode специальное сообщение, которое легко проверять и оно не содержит stack
            `${ev.source}: ${ev.stack}`,
      },
      // service.options
      {
        kind: 'info',
        type: 'service.options',
        validate: validateEventFactory({
          _extends: BaseEvent,
          serviceType: {type: VType.String().notEmpty()},
          options: {type: VType.Object()},
        }),
        toString: ev => `${ev.source}: options: '${prettyPrint(ev.options)}'`,
      },
    ]
  );
})