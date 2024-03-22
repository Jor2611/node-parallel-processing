import { Strategy } from "./strategy";
import FirstAvailableStrategy from "../FirstAvailable.strategy";
import RobinRoundStrategy from "../RoundRobin.strategy";

const StrategyMap: Map<string, new (...args: any[]) => Strategy<any>> = new Map();

StrategyMap.set('first-available', FirstAvailableStrategy);
StrategyMap.set('robin-round', RobinRoundStrategy);

export { StrategyMap };