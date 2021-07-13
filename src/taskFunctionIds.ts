import { TaskFunctionId } from "kachery-js/types/kacheryTypes"
import taskFunctionIdsFromFile from './python/surfaceview3/backend/task_function_ids.json'

const taskFunctionIds: TaskFunctionId[] = taskFunctionIdsFromFile.map(x => (x as any as TaskFunctionId))

export default taskFunctionIds