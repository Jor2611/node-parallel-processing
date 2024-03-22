export type AvailableDataStoreTypes = Array<any> | Map<any,any[]>

export enum MessageActionTypes {
  Init = 'init',
  Commit ='commit',
  Fail = 'fail',
  Transfer = 'transfer'
} 

export interface MessageSchema {
  workerId: number;
  content: any[];
  action: MessageActionTypes 
}