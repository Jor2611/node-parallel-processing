import cluster, { Worker } from "cluster";
import { AvailableDataStoreTypes } from "./constants";

export abstract class Strategy<T>{
  protected workers: Worker[] = [];
  protected DLQ : Array<T[]> = [];
  protected abstract dataStore: AvailableDataStoreTypes;

  public async configure(workersAmount: number, chunkSize: number, collection: T[]): Promise<void> {
    try{
      await this.forkWorkers(workersAmount, chunkSize, collection.length);
      await this.registerTerminationEvents();
      await this.configureDataStore(chunkSize, collection);
      await this.configureWorkers();
    }catch(err){
      console.log(err);
    }
  }

  protected abstract configureDataStore(chunkSize: number, collection: T[]): Promise<void>;
  protected abstract configureWorkers(): Promise<void>;

  private async forkWorkers(workersAmount: number, chunkSize: number, dataLength: number): Promise<void> {  
    const maxNeededWorkersAmount = Math.ceil(dataLength/chunkSize);
    workersAmount = maxNeededWorkersAmount < workersAmount ? maxNeededWorkersAmount : workersAmount;
    
    for(let workerId = 1; workerId <= workersAmount; workerId++){
      const worker: Worker = cluster.fork({ workerId });
      this.workers.push(worker);
    }
  }

  private async registerTerminationEvents(): Promise<void> {
    cluster.on('exit', (worker) => {      
      console.log(`Worker ${worker!.id} turned off`);
    });

    process.on('exit',() => {
      console.log(`Message chunks count in DLQ: ${this.DLQ.length}`);
    });
  }
}

export function strategyClient<T>(strategy: Strategy<T>, workersAmount: number, chunkSize: number, collection: T[]){
  strategy.configure(workersAmount, chunkSize, collection);
}  