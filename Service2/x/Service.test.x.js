import test from 'ava'
import path from 'path'
import sinon from 'sinon'

import Service, {
  NOT_INITIALIZED,
  INITIALIZING,
  INITIALIZED,
  STARTING,
  READY,
  STOPPING,
  STOPPED,
  FAILED,
  DISPOSING,
  DISPOSED,
} from '../Service'

let clock;
test.beforeEach(t => { clock = sinon.useFakeTimers(); });
test.afterEach(t => { clock.restore(); });

function promiseTest() {
  return new Promise(function (resolve, reject) {
    setTimeout(() => { resolve('ok'); }, 200);
  })
}

test.only(`Нормальный цикл`, async t => {

  const svc = new Service('test');
  svc._serviceInit = sinon.returns(Promise.resolve().delay(100));
  svc._serviceStart = sinon.returns(Promise.resolve().delay(100));
  svc._serviceStop = sinon.returns(Promise.resolve().delay(100));
  svc._serviceDispose = sinon.returns(Promise.resolve().delay(100));







  // t.throw(await promiseTest().timeout(100));

  const p = promiseTest().timeout(100);

  clock.tick(250);

  t.throws(p, Promise.TimeoutError);

  // let h = false;
  //
  // setTimeout(v => t.true(h), 100);
  //
  // h = true;
  //
  // clock.tick(150);
  //
  // t.true(h);
  //
  // clock.tick();




  // setTimeout(v => { h = true; }, 100);
  //
  // clock.tick(50);
  //
  // t.false(h);
  //
  // clock.tick(50);
  //
  // t.true(h);




  //  const svc = new Service('test_service');

  // нужен класс наследник, чтоб управлять методами переходами состояний

  //






});



// const _testFilename = path.join(path.relative(process.cwd(), __dirname), path.basename(__filename, '.js'));
//
// class TestService extends Service {
//
//   async _init() {
//     super._init();
//   }
//
//   async someAction() {
//     this._checkState();
//   }
// }
//
// async function getSVC() {
//   let svc = new TestService();
//   await svc._init();
//   return svc;
// }
//
// // zork: Я не понял, что именно я хотел сказать этим тестом.  Но пока вызываемые методы сами не проверяются свои аргументы
// // test(`${_testFilename}: Пропущенный параметр метода`, async t => {
// //   let svc = new CachedResponsesService();
// //   await svc._init();
// //   t.throws(() => svc._find());
// //   t.throws(() => svc._argsToKey());
// // });
//
// test(`${_testFilename}: Основные состояния сервиса`, async t => {
//   let srv = new TestService();
//   t.is(srv.__state, NOT_INITIALIZED);
//   await srv._init();
//   t.is(srv.__state, READY);
//   srv.__stopped();
//   t.is(srv.__state, STOPPED);
//   srv.__started();
//   t.is(srv.__state, READY);
// });
//
// test(`${_testFilename}: Подписка на сервис. Событие - сбой сервиса`, async t => {
//   let srv = new TestService();
//
//   let state, prevState, reason = null;
//   let unlisten = srv.__stat
//   eSubscribe(function (_state, _prevState, _reason) {
//     state = _state;
//     prevState = _prevState;
//     reason = _reason;
//   });
//
//   await srv._init();
//
//   t.is(state, READY);
//   t.is(prevState, NOT_INITIALIZED);
//   t.is(reason, undefined);
//
//   const someReason = {};
//   srv.__failed(someReason);
//
//   t.is(state, FAILURE);
//   t.is(prevState, READY);
//   t.is(reason, someReason);
//
//   srv.__started();
//   t.is(state, READY);
//   t.is(prevState, FAILURE);
//   t.is(reason, undefined);
// });
//
// test(`${_testFilename}: Пока сервис не прошёл _init, операции возвращают ошибку`, async t => {
//   let srv = new TestService();
//
//   t.throws(srv.someAction());
//   await srv._init();
//   await srv.someAction();
// });