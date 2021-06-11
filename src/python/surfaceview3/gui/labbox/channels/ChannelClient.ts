import GoogleSignInClient from "../googleSignIn/GoogleSignInClient"
import { ObjectStorageClient } from "../objectStorage/createObjectStorageClient"
import { ChannelName, FeedId, SubfeedHash, SubfeedMessage } from "../types/kacheryTypes"
import SubfeedManager from "./feeds/SubfeedManager"
import { TaskStatus } from "./tasks/Task"
import TaskManager from "./tasks/TaskManager"
import { UserPermissions } from "./useCurrentUserPermissions"

class ChannelClient {
    #taskManager: TaskManager
    #subfeedManager: SubfeedManager
    constructor(public channelName: ChannelName, objectStorageClient: ObjectStorageClient, googleSignInClient: GoogleSignInClient) {
        const clientChannel = undefined
        this.#taskManager = new TaskManager(clientChannel, objectStorageClient, googleSignInClient)
        this.#subfeedManager = new SubfeedManager(clientChannel, objectStorageClient, googleSignInClient)
    }
    initiateTask<ReturnType>(functionId: string, kwargs: {[key: string]: any}) {
        return this.#taskManager.initiateTask<ReturnType>(functionId, kwargs)
    }
    subscribeToSubfeed(opts: {feedId: FeedId, subfeedHash: SubfeedHash, onMessages: (msgs: SubfeedMessage[], messageNumber: number) => void, downloadAllMessages: boolean, position: number}) {
        return this.#subfeedManager.subscribeToSubfeed(opts)
    }
    appendMessagesToSubfeed(opts: {feedId: FeedId, subfeedHash: SubfeedHash, messages: SubfeedMessage[]}) {
        return this.#subfeedManager.appendMessagesToSubfeed(opts)
    }
    async runTaskAsync<ReturnType>(functionId: string, kwargs: {[key: string]: any}) {
        return await runTaskAsync<ReturnType>(this, functionId, kwargs)
    }
    public get allTasks() {
        return this.#taskManager.allTasks
    }
    public get currentUserPermissions(): UserPermissions {
        return {} // todo
    }
    onCurrentUserPermissionsChanged(callback: () => void) {
        // todo
    }
}

const runTaskAsync = async <ReturnType>(client: ChannelClient, functionId: string, kwargs: {[key: string]: any}): Promise<ReturnType> => {
    const task = client.initiateTask<ReturnType>(functionId, kwargs)
    if (!task) throw Error('Unable to initiate task')
    return new Promise((resolve, reject) => {
        let complete = false
        const check = () => {
            if (complete) return
            if (task.status === 'finished') {
                complete = true
                const r = task.returnValue
                if (!r) {
                    reject(new Error('Unexpected, result is null.'))
                    return
                }
                resolve(r)
            }
            else if (task.status === 'error') {
                complete = true
                reject(new Error(task.errorMessage))
            }
        }
        task.onStatusChanged((s: TaskStatus) => {
            check()
        })
        check()
    })
}

export default ChannelClient