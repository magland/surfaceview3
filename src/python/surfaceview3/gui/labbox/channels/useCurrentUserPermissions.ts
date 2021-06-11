import { useEffect, useState } from 'react'
import { isBoolean, isFeedId, isObjectOf, optional, _validateObject } from '../types/kacheryTypes'
import { useChannelClient } from './useChannels'

type UserFeedPermissions = {
    append?: boolean
}
const isUserFeedPermissions = (x: any): x is UserFeedPermissions => {
    return _validateObject(x, {
        append: optional(isBoolean)
    }, {allowAdditionalFields: true})
}

export type UserPermissions = {
    admin?: boolean
    appendToAllFeeds?: boolean
    feeds?: {[key: string]: UserFeedPermissions}
}
export const isUserPermissions = (x: any): x is UserPermissions => {
    return _validateObject(x, {
        admin: optional(isBoolean),
        appendToAllFeeds: optional(isBoolean),
        feeds: optional(isObjectOf(isFeedId, isUserFeedPermissions))
    }, {allowAdditionalFields: true})
}

const useCurrentUserPermissions = (): UserPermissions | undefined => {
    const [, setUpdateCode] = useState<number>(0)
    const client = useChannelClient()
    useEffect(() => {
        // only once per client
        client && client.onCurrentUserPermissionsChanged(() => {
            setUpdateCode(c => (c + 1))
        })
    }, [client])
    return client?.currentUserPermissions
}

export default useCurrentUserPermissions