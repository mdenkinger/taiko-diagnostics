jest.mock('../../src/helpers');
import { closeBrowser, diagnostics, goto, openBrowser } from 'taiko';
import path from 'path';

const { logConsoleInfo } = diagnostics;

jest.setTimeout(30000);
beforeEach(async () => {
  await openBrowser();
});

afterEach(async () => {
  await closeBrowser();
});

test('Should print unhandled exception message into console', async () => {
  let filePath = path.resolve(
    './integration/__tests__/data/unhandledException.html'
  );
  const error = [];
  let emitter = await logConsoleInfo();
  emitter.on('pageError', e => {
    error.push(e);
  });

  await goto(path.join('file://', filePath));
  let expectedMessage = `Error: Test unhandled exception
    at throwsException (file://${filePath}:4:19)
    at file://${filePath}:6:9`;
  expect(error[0].exception.description).toEqual(expectedMessage);
});

test('Should print error message into console', async () => {
  const logEntry = [];
  const emitter = await logConsoleInfo();
  emitter.on('logEntry', log => {
    logEntry.push(log);
  });
  await goto('https://www.reddit.com/');
  const responseData = {
    level: expect.any(String),
    source: expect.any(String),
    url: expect.any(String),
    networkRequestId: expect.any(String),
    text: expect.any(String),
    timestamp: expect.any(Number)
  };
  expect(logEntry[0]).toMatchObject(responseData);
});

test('Should print console.log', async () => {
  const consoleEvents = [];
  const emitter = await logConsoleInfo();
  emitter.on('consoleLog', log => {
    consoleEvents.push(log);
  });
  let filePath = path.resolve('./integration/__tests__/data/console.html');
  await goto(path.join('file://', filePath));
  const responseData = {
    type: expect.any(String),
    value: expect.any(String),
    url: expect.any(String),
    args: expect.any(Array),
    executionContextId: expect.any(Number),
    stackTrace: expect.any(Object),
    timestamp: expect.any(Number)
  };

  expect(consoleEvents[0]).toMatchObject({
    ...responseData,
    type: 'log',
    value: 'Testing..'
  });
  expect(consoleEvents[1]).toMatchObject({
    ...responseData,
    type: 'info',
    value: 'Debug..'
  });
  expect(consoleEvents[2]).toMatchObject({
    ...responseData,
    type: 'warning',
    value: 'Warning..'
  });
  expect(consoleEvents[3]).toMatchObject({
    ...responseData,
    type: 'error',
    value: 'Error..'
  });
});
