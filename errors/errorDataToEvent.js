import buildFullErrorMessage from '../utils/buildFullErrorMessage'
import reduceErrorStack from '../utils/reduceErrorStack'

/**
 * Заполняет сообщение для шины, на основе данных объекта типа Error.
 */
export default function errorDataToEvent(error, event, field = `error`) {
  const message = buildFullErrorMessage(error);
  event[field] = {
    message,
  };
  if (error.stack) {
    event.stack = reduceErrorStack(error, message);
  }
  if (hasOwnProperty.call(error, 'context')) {
    event.context = error.context;
  }
  if (hasOwnProperty.call(error, 'calls')) {
    event.calls = error.calls;
  }
};
