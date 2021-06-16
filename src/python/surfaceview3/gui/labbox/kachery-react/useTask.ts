import { useCallback, useEffect, useMemo, useState } from "react";
import useSelectedChannel from "../../pages/Home/useSelectedChannel";
import { JSONStringifyDeterministic, TaskFunctionId, TaskKwargs } from "../kachery-js/types/kacheryTypes";
import { TaskFunctionType } from "../kachery-js/types/pubsubMessages";
import initiateTask, { Task } from "./initiateTask";
import useKacheryNode from "./useKacheryNode";

const useTask = <ReturnType>(functionId: TaskFunctionId | string, kwargs: TaskKwargs | {[key: string]: any}, functionType: TaskFunctionType) => {
    const [task, setTask] = useState<Task<ReturnType> | undefined>(undefined)
    const kacheryNode = useKacheryNode()
    const {selectedChannel: channelName} = useSelectedChannel()
    const [, setUpdateCode] = useState<number>(0)
    const incrementUpdateCode = useCallback(() => {setUpdateCode(c => (c+1))}, [])
    const kwargsString = JSONStringifyDeterministic(kwargs)
    useEffect(() => {
        let valid = true
        
        const kwargs2 = JSON.parse(kwargsString) as any as TaskKwargs

        const onStatusChanged = () => {
            if (!valid) return
            incrementUpdateCode()
        }

        const t = initiateTask<ReturnType>({
            kacheryNode,
            channelName,
            functionId,
            kwargs: kwargs2,
            functionType,
            onStatusChanged
        })
        
        setTask(t)

        return () => {
            valid = false
        }
    }, [functionId, kwargsString, functionType, channelName, kacheryNode, incrementUpdateCode])
    const taskStatus = task ? task.status : undefined
    const returnValue = useMemo(() => {
        if (!task) return undefined
        return taskStatus === 'finished' ? task.result : undefined
    }, [task, taskStatus])
    return useMemo(() => ({
        returnValue,
        task
    }), [returnValue, task])
}

export default useTask