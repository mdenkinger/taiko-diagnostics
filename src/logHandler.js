class LogHandler {
  constructor(entryAdded, loadEventFired, runTime) {
    this._entryAdded = entryAdded;
    this._loadEventFired = loadEventFired;
    this._runTime = runTime;
  }

  logEntry(emitter) {
    this._entryAdded(({ entry }) => {
      emitter.emitObject('logEntry', {
        ...entry,
      });
    });

    this._runTime.consoleAPICalled((params) => {
      const [{ value }] = params.args;
      const [{ url }] = params.stackTrace.callFrames;
      emitter.emitObject('consoleLog', {
        type: params.type,
        value,
        url,
        ...params,
      });
    });

    this._runTime.exceptionThrown(({ exceptionDetails }) => {
      emitter.emitObject('pageError', {
        ...exceptionDetails,
      });
    });
    this._loadEventFired();
  }
}

export default LogHandler;
