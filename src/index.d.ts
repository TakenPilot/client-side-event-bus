// Type definitions for client-side-event-bus

// it's a global when in non-module environments
import {ClientSideEventBus} from "./index";

export as namespace Bus;

// it's a class that can be imported
export = Bus;

declare class Bus implements ClientSideEventBus {
  constructor();

  on(topicStr: string, fn: () => void): () => void;
  emit(topicStr: string, message?: any): Promise<any>[];
  history(topicStr: string): Record<string, number>[]
}

declare namespace Bus {
  interface ClientSideEventBus {
    on(topicStr: string, fn: () => void): () => void;
    emit(topicStr: string, message?: any): Promise<any>[];
    history(topicStr: string): Record<string, number>[]
  }

  interface RingBuffer {
    push(item: any): void;
    asArray(): any[];
    list: any[];
  }

  export class Ring implements RingBuffer {
    constructor(max: number);

    push(item: any): void;
    asArray(): any[];
    list: any[];
  }
}