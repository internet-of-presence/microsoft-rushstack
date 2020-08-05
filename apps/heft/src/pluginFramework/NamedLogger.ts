// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import { Terminal, ITerminalProvider } from '@rushstack/node-core-library';

import { IHeftPlugin } from './IHeftPlugin';
import { PrefixProxyTerminalProvider } from '../utilities/PrefixProxyTerminalProvider';

export interface INamedLoggerOptions {
  requestingPlugin: IHeftPlugin;
  loggerName: string;
  terminalProvider: ITerminalProvider;
  getVerboseEnabled: () => boolean;
}

/**
 * @public
 */
export class NamedLogger {
  private readonly _options: INamedLoggerOptions;
  private readonly _errors: Error[] = [];
  private readonly _warnings: Error[] = [];

  private get _logVerbose(): boolean {
    return this._options.getVerboseEnabled();
  }

  public get errors(): ReadonlyArray<Error> {
    return [...this._errors];
  }

  public get warnings(): ReadonlyArray<Error> {
    return [...this._warnings];
  }

  /**
   * @internal
   */
  public readonly _requestingPlugin: IHeftPlugin;

  public readonly loggerName: string;

  public readonly terminalProvider: ITerminalProvider;

  public readonly terminal: Terminal;

  /**
   * @internal
   */
  public constructor(options: INamedLoggerOptions) {
    this._options = options;
    this._requestingPlugin = options.requestingPlugin;
    this.loggerName = options.loggerName;

    this.terminalProvider = new PrefixProxyTerminalProvider(
      options.terminalProvider,
      `[${this.loggerName}] `
    );
    this.terminal = new Terminal(this.terminalProvider);
  }

  /**
   * Call this function to emit an error to the heft runtime.
   */
  public emitError(error: Error): void {
    this._errors.push(error);
    this.terminal.writeErrorLine(error.message);
    if (this._logVerbose && error.stack) {
      this.terminal.writeErrorLine(error.stack);
    }
  }

  /**
   * Call this function to emit an warning to the heft runtime.
   */
  public emitWarning(warning: Error): void {
    this._warnings.push(warning);
    this.terminal.writeWarningLine(warning.message);
    if (this._logVerbose && warning.stack) {
      this.terminal.writeWarningLine(warning.stack);
    }
  }
}
