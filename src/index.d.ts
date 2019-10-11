declare class Ring {
  constructor(max: number);

  push(item: any): void;
  asArray(): any[];
  list: any[];
}

declare class Bus {
  constructor();

  on(topicStr: string, fn: () => void): () => void;
  emit(topicStr: string, message?: any): Promise<any>[];
  history(topicStr: string): Record<string, number>[]
  static Ring: typeof Ring;
}
