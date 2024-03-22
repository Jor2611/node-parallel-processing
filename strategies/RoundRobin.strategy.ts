import { Worker } from "cluster";
import { Strategy } from "./_meta/strategy";
import { MessageActionTypes, MessageSchema } from "./_meta/constants";

export default class RobinRoundStrategy extends Strategy<any>{
  protected dataStore: Map<any,any[]> = new Map();

  protected async configureDataStore(chunkSize: number, collection: any[]): Promise<void> {
    this.workers.forEach((worker) => {
      this.dataStore.set(worker.id, []);
    });

    let chunk: any[] = [];
    collection.forEach((item: any, i: number) => {
      chunk.push(item);
      if((i+1) % chunkSize === 0 || i === collection.length - 1){
        const workerId = (Math.ceil((i)/chunkSize) % this.workers.length) + 1 ;
        const workerQueue = this.dataStore.get(workerId);
        workerQueue!.push(chunk);
        this.dataStore.set(workerId, workerQueue!);
        chunk = [];
      }
    });
  }

  protected async configureWorkers(): Promise<void> {
    for(const worker of this.workers){
      if(!this.dataStore.get(worker.id)!.length) break;
      this._registerWorkerHandler(worker);
    }
  }

  private _registerWorkerHandler(worker: Worker): void {
    let queue = this.dataStore.get(worker.id);
    worker.send({ content: queue!.shift(), workerId: worker.id, action: MessageActionTypes.Init });
    this.dataStore.set(worker.id, queue!);

    worker.on('message', (message: MessageSchema) => {
      if(message && message.workerId){
        if(message.action === MessageActionTypes.Fail){
          this.DLQ.push(message.content);
        } else {
          console.log(`Worker [${message.workerId}] commits messages.`);
        }

        if(!this.dataStore.get(worker.id)!.length){
          worker.destroy();
          return;
        }

        let queue = this.dataStore.get(worker.id);
        worker.send({ content: queue!.shift(), workerId: message.workerId, action: MessageActionTypes.Transfer });
        this.dataStore.set(worker.id, queue!);
      }
    });
  }
}
