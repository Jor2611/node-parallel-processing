import cluster from 'cluster';
import { availableParallelism } from 'os';
import { StrategyMap } from './strategies/_meta/registry';
import { strategyClient } from './strategies/_meta/strategy';
import { MessageActionTypes, MessageSchema } from './strategies/_meta/constants';

(async() => {
  interface Todo {
    id: number;
    userId: number;
    title: string;
    completed: boolean;
  }

  if(cluster.isPrimary){
    const availableCores = availableParallelism();
    const strategyName = process.argv[2] || 'first-available';
    const workersCount = parseInt(process.argv[3],10) || 2;
    const chunkSize = parseInt(process.argv[4],10) || 50;

    if(availableCores < workersCount) {
      console.error('Provided number for amount of workers greater than available cores!');
      process.exit(1);
    }

    const response = await fetch('https://jsonplaceholder.typicode.com/todos');
    const responseData: Todo[] = await response.json();

    if(!responseData.length){
      console.error('No Data to process!');
      process.exit(0);
    }
    
    const Strategy = StrategyMap.get(strategyName.toLowerCase());

    if(!Strategy){
      console.log('Unkown strategy')
      process.exit(0);
    }

    strategyClient<Todo>(new Strategy(), workersCount, chunkSize, responseData);
  }else{
    process.on('message', (message: MessageSchema) => {
      message.content.forEach((todo: Todo) => console.log(`Worker [${process.env.workerId}] processing todo ${todo.id}`)); 
      process.send!({ workerId: process.env.workerId, action: MessageActionTypes.Commit, content: [] });

      // In case we want to fail message processing, worker will  
      // send back failed chunk to masters DLQ
      // process.send!({ workerId: message.workerId, action: MessageActionTypes.Fail, content: message.content });
    });
  }
})()

