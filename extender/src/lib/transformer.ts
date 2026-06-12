import { Collection, UserDataCollectionDocumentType } from '@kompakkt/common';
import { v7 as uuidv7 } from 'uuid';

export type TransformableType = `${Collection}`;
export type TransformerFn<T> = (data: T) => Promise<T>;

export const ExtenderTransformer = new (class ExtenderTransformer {
  public readonly transformers = new Map<TransformableType, Map<string, TransformerFn<any>>>();

  public registerTransformer<T extends TransformableType>(
    type: T,
    transformer: TransformerFn<UserDataCollectionDocumentType<T>>,
  ) {
    if (!this.transformers.has(type)) {
      this.transformers.set(type, new Map());
    }
    const id = uuidv7();
    this.transformers.get(type)?.set(id, transformer);
    return id;
  }

  public unregisterTransformer(type: TransformableType, id: string) {
    return this.transformers.get(type)?.delete(id) ?? false;
  }

  public async applyTransformations<T>(type: TransformableType, data: T): Promise<T> {
    const transformers = this.transformers.get(type) ?? new Map<string, TransformerFn<any>>();
    if (!transformers || transformers.size === 0) return data;
    let result = data;
    for (const [_, transformer] of transformers) {
      const modified = await transformer(result).catch(err => {
        console.error(`Error applying transformer for type ${type}:`, err);
        return result;
      });
      result = modified ?? result;
    }
    return result;
  }
})();
