import type { IAnnotation, IDigitalEntity, IEntity, IPhysicalEntity } from '../common';

export type ITransformable = IAnnotation | IEntity | IDigitalEntity | IPhysicalEntity;
export type TransformableType = 'annotation' | 'entity' | 'digitalentity' | 'physicalentity';
export type TransformerFn<T extends ITransformable> = (data: T) => T | Promise<T>;

export const ExtenderTransformer = new (class ExtenderTransformer {
  public readonly transformers: Record<TransformableType, Array<TransformerFn<any>>> = {
    annotation: [],
    entity: [],
    digitalentity: [],
    physicalentity: [],
  };

  public registerTransformer<T extends ITransformable>(
    type: TransformableType,
    transformer: TransformerFn<T>,
  ) {
    this.transformers[type].push(transformer);
  }

  public async applyTransformations<T extends ITransformable>(
    type: TransformableType,
    data: T,
  ): Promise<T> {
    const transformers = this.transformers[type];
    if (!transformers || transformers.length === 0) return data;
    let result = data;
    for (const transformer of transformers) {
      result = await transformer(result);
    }
    return result;
  }
})();
