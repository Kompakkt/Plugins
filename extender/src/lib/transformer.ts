import { Collection } from '../common';

export type TansformableType = `${Collection}`;
export type TransformerFn<T> = (data: T) => T | Promise<T>;

export const ExtenderTransformer = new (class ExtenderTransformer {
  public readonly transformers = new Map<TansformableType, Array<TransformerFn<any>>>();

  public registerTransformer<T>(type: TansformableType, transformer: TransformerFn<T>) {
    if (!this.transformers.has(type)) {
      this.transformers.set(type, []);
    }
    this.transformers.get(type)?.push(transformer);
  }

  public async applyTransformations<T>(type: TansformableType, data: T): Promise<T> {
    const transformers = this.transformers.get(type) ?? [];
    if (!transformers || transformers.length === 0) return data;
    let result = data;
    for (const transformer of transformers) {
      result = await transformer(result);
    }
    return result;
  }
})();
