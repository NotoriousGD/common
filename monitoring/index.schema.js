import { VType, validate } from '../validation/index';

export const ctor_options = validate.ctor.this({
  key: { required: true, type: VType.String()},
  countersResetPeriod: { required: true, type: VType.Int()},
});

export const addCounter_args = validate.method.this('args', {
  service: {required: true, type: VType.Object(), validate: v => v._service ? true : 'not a Service'}, // сервис, к которму относится счетчик
  name: {required: true, type: VType.String().notEmpty()}, // название счетчика в snake-формате, полное название счетчика будет <имя сервиса>_<имя счетчика>
  type: {required: true, type: VType.String().notEmpty()}, // тип счётчика, times, sum, avg ...
});

export const addCounterFunction_args = validate.method.this('args', {
  serviceName: {required: true, type: VType.String().notEmpty()}, // имя сервис, к которму относится счетчик
  name: {required: true, type: VType.String().notEmpty()}, // название счетчика в snake-формате, полное название счетчика будет <имя сервиса>_<имя счетчика>
  type: {required: true, type: VType.String().notEmpty()}, // тип счётчика, times, sum, avg ...
});
