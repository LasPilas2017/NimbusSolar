/**
 * Result (Ok / Err) para casos de uso:
 *  - return Result.ok(data)
 *  - return Result.err(message, meta?)
 */
export class Result {
  constructor(ok, data, error, meta) {
    this.ok = ok;
    this.data = data;
    this.error = error;
    this.meta = meta;
  }
  static ok(data, meta) { return new Result(true, data, null, meta); }
  static err(error, meta) { return new Result(false, null, error, meta); }
}
