import test from 'ava'
import path from 'path'
import sinon from 'sinon'

import Service, {
  WAITING_OTHER_SERVICES_TO_START,
  INITIALIZING,
  INITIALIZE_FAILED,
  INITIALIZED,
  STARTING,
  READY,
  STOPPING,
  STOPPED,
  FAILED,
  DISPOSING,
  DISPOSED,
} from './Service'

let clock;
test.beforeEach(t => {
  clock = sinon.useFakeTimers();
});
test.afterEach(t => {
  clock.restore();
});

test.only(`На каждый шаг есть _service... метод, и всё идет без ошибок`, async t => {
  const svc = Service('testService', {
    _serviceInit: () => Promise.delay(100), // не получилось сделать через sinon.stub() - не нашёл как возвращать Promise.delay именно в момент использования метода
    _serviceStart: () => Promise.delay(100),
    _serviceStop: () => Promise.delay(100),
    _serviceDispose: () => Promise.delay(100),
  });
  t.is(svc._state, INITIALIZING);
  clock.tick(100);
  t.is(svc._state, STARTING);
  clock.tick(100);
  t.is(svc._state, READY);
  clock.tick(100); // так как ситуация не меняется, то состояние остается ready
  t.is(svc._state, READY);
  svc._stop();
  t.is(svc._state, STOPPING);
  clock.tick(100);
  t.is(svc._state, STOPPED);
  svc._start();
  t.is(svc._state, STARTING);
  clock.tick(100);
  t.is(svc._state, READY);
  svc._dispose();
  t.is(svc._state, STOPPING);
  clock.tick(100);
  t.is(svc._state, DISPOSING);
  clock.tick(100);
  t.is(svc._state, DISPOSED);
  svc._stop(); // если сервис уже disposed, то операции _start и _stop на состояние не влияют
  t.is(svc._state, DISPOSED);
  svc._start(); //
  clock.tick(100);
  t.is(svc._state, DISPOSED);
});


test.only(`Цикл без методов _serviceInit, ...Start, ...Stop, ...Dispose`, async t => {
  const svc = Service('testService', {});
  const events = [];
  svc._serviceSubscribe((state, prevState, reason) => { events.push({state, prevState, reason});})

  t.is(svc._state, READY);
  svc._stop();
  t.is(svc._state, STOPPED);
  svc._start();
  t.is(svc._state, READY);
  svc._dispose();
  t.is(svc._state, DISPOSED);

  t.deepEqual(events, [
    {state: STOPPED, prevEvent: READY},
    {state: READY, prevEvent: STOPPED},
    {state: STOPPED, prevEvent: READY},
    {state: READY, prevEvent: STOPPED},
    {state: STOPPED, prevEvent: DISPOSED},
  ]);

});

