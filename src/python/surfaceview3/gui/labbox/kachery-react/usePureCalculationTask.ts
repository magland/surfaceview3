import { TaskFunctionId, TaskKwargs } from "../kachery-js/types/kacheryTypes";
import useTask from "./useTask";

const useQueryTask = <ReturnType>(functionId: TaskFunctionId | string, kwargs: TaskKwargs | {[key: string]: any}) => {
    return useTask<ReturnType>(functionId, kwargs, 'pure-calculation')
}

export default useQueryTask