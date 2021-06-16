import axios from "axios"
import KacheryDaemonNode from "../kachery-js/KacheryDaemonNode"
import { ChannelName, errorMessage, ErrorMessage, isTaskFunctionId, isTaskKwargs, JSONValue, nowTimestamp, scaledDurationMsec, TaskFunctionId, TaskId, TaskKwargs, TaskStatus, Timestamp, UrlString } from "../kachery-js/types/kacheryTypes"
import { TaskFunctionType } from "../kachery-js/types/pubsubMessages"
import deserializeReturnValue from "./deserializeReturnValue"

export class Task<ReturnType> {
    #status: TaskStatus = 'waiting'
    #taskResultUrl: UrlString | undefined = undefined
    #queryResult: JSONValue | undefined = undefined
    #errorMessage: ErrorMessage | undefined = undefined
    #result: ReturnType | undefined = undefined
    #taskId: TaskId | undefined = undefined
    #timestampInitiated: Timestamp = nowTimestamp()
    #timestampCompleted: Timestamp | undefined = undefined
    constructor(private args: {kacheryNode: KacheryDaemonNode, channelName: ChannelName, functionId: TaskFunctionId, kwargs: TaskKwargs, functionType: TaskFunctionType, onStatusChanged: () => void}) {
        this._start()
    }
    public get functionId() {
        return this.args.functionId
    }
    public get functionType() {
        return this.args.functionType
    }
    public get timestampInitiated() {
        return this.#timestampInitiated
    }
    public get timestampCompleted() {
        return this.#timestampCompleted
    }
    public get status() {
        return this.#status
    }
    public get taskResultUrl() {
        return this.#taskResultUrl
    }
    public get errorMessage() {
        return this.#errorMessage
    }
    public get kwargs() {
        return this.args.kwargs
    }
    public get result() {
        return this.#result
    }
    public get taskId() {
        return this.#taskId
    }
    async _fetchPureCalculationResult() {
        const functionType = this.args.functionType
        if (functionType === 'pure-calculation') {
            const url = this.#taskResultUrl
            if (!url) return undefined
            const x = await axios.get(url.toString(), {responseType: 'json'})
            const result = x.data
            return result as any as ReturnType
        }
        else {
            return undefined
        }
    }
    async _start() {
        const { kacheryNode, channelName, functionId, kwargs, functionType } = this.args
        const x = await kacheryNode.kacheryHubInterface().requestTaskFromChannel({
            channelName,
            taskFunctionId: functionId,
            taskKwargs: kwargs,
            taskFunctionType: functionType,
            timeoutMsec: scaledDurationMsec(1000)
        })
        const {taskId, status, taskResultUrl, queryResult, errorMessage} = x
        this.#taskId = taskId

        await this._updateStatus(status, taskResultUrl, queryResult, errorMessage)
        while (!['error', 'finished'].includes(this.#status)) {
            const y = await kacheryNode.kacheryHubInterface().waitForTaskResult({
                channelName,
                taskId,
                timeoutMsec: scaledDurationMsec(1000 * 10),
                taskFunctionType: functionType
            })
            await this._updateStatus(y.status, y.taskResultUrl, y.queryResult, y.errorMessage)
        }
    }
    async _updateStatus(status: TaskStatus, taskResultUrl: UrlString | undefined, queryResult: JSONValue | undefined, errMsg: ErrorMessage | undefined) {
        if (status === this.#status) return
        this.#taskResultUrl = taskResultUrl
        this.#queryResult = queryResult
        this.#errorMessage = errMsg
        if (status === 'finished') {
            if (this.args.functionType === 'pure-calculation') {
                let result
                try {
                    result = await this._fetchPureCalculationResult()
                }
                catch(err) {
                    this.#errorMessage = errorMessage('Problem fetching pure calculation result even though status is finished')
                    this.#status = 'error'
                    this.#timestampCompleted = nowTimestamp()
                    this.args.onStatusChanged()
                    return
                }
                if (!result) {
                    this.#errorMessage = errorMessage('Result is undefined even though status is finished')
                    this.#status = 'error'
                    this.#timestampCompleted = nowTimestamp()
                    this.args.onStatusChanged()
                    return
                }
                this.#result = deserializeReturnValue(result)
                this.#status = 'finished'
                this.#timestampCompleted = nowTimestamp()
                this.args.onStatusChanged()
            }
            else if (this.args.functionType === 'query') {
                if (!this.#queryResult) {
                    this.#errorMessage = errorMessage('No query result even though status is finished')
                    this.#status = 'error'
                    this.#timestampCompleted = nowTimestamp()
                    this.args.onStatusChanged()
                    return
                }
                this.#result = this.#queryResult as any as ReturnType
                this.#status = 'finished'
                this.#timestampCompleted = nowTimestamp()
                this.args.onStatusChanged()
            }
            else {
                this.#status = status
                this.args.onStatusChanged()
            }
        }
        else {
            this.#status = status
            this.args.onStatusChanged()
        }
    }
}

const initiateTask = <ReturnType>(args: {kacheryNode: KacheryDaemonNode, channelName: ChannelName, functionId: TaskFunctionId | string | undefined, kwargs: TaskKwargs | {[key: string]: any}, functionType: TaskFunctionType, onStatusChanged: () => void}) => {
    const { kacheryNode, channelName, functionId, kwargs, functionType, onStatusChanged } = args
    if (!functionId) return undefined
    if (!isTaskFunctionId(functionId)) {
        throw Error(`Invalid task function ID: ${functionId}`)
    }
    if (!isTaskKwargs(kwargs)) {
        console.warn(kwargs)
        throw Error(`Invalid task kwargs in ${functionId}`)
    }

    const task = new Task<ReturnType>({kacheryNode, channelName, functionId, kwargs, functionType, onStatusChanged})
    return task
}

export default initiateTask