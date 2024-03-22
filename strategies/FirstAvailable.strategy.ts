import { Worker } from "cluster";
import { Strategy } from "./_meta/strategy";
import { MessageActionTypes, MessageSchema } from "./_meta/constants";


export default class FirstAvailableStrategy extends Strategy<any>{
  protected dataStore: Array<any> = [];

  protected async configureDataStore(chunkSize: number, collection: any[]): Promise<void> {
    let chunk: Array<any> = [];
    collection.forEach((item: any, i: number) => {
      chunk.push(item);
      if((i+1) % chunkSize === 0 || i === collection.length - 1){
        this.dataStore.push(chunk);
        chunk = [];
      }
    });
  }

  protected async configureWorkers(): Promise<void> {
    for(const worker of this.workers){
      if(!this.dataStore.length) break;
      this._registerWorkerHandler(worker);
    }
  }

  private _registerWorkerHandler(worker: Worker): void {
    worker.send({ content: this.dataStore.shift(), workerId: worker.id, action: MessageActionTypes.Init });
    
    worker.on('message',(message: MessageSchema) => {
      if(message && message.workerId){
        if(message.action === MessageActionTypes.Fail){
          this.DLQ.push(message.content);
        } else {
          console.log(`Worker [${message.workerId}] commits messages.`);
        }

        if(!this.dataStore.length){
          worker.destroy();
          return;
        }

        const chunk = this.dataStore.shift();
        worker.send({ content: chunk, workerId: message.workerId, action: MessageActionTypes.Transfer });
      }
    });
  }
}
