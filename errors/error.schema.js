import {VType} from '../validation'

export const eventErrorSchema = {
  message: {required: true, type: VType.String().notEmpty()},
  stack: {type: VType.String().notEmpty()}, // стандартный call-stack из объекта Error, желательно, уменьшенный за счет выкидывания строк системного кода
  context: {type: VType.String()},
  calls: {type: VType.Array()},
  _final: true,
};
