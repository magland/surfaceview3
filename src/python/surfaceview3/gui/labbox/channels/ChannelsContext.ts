import React from 'react'
import { ChannelName } from '../types/kacheryTypes'
import ChannelClient from './ChannelClient'

export type ChannelConfig = {
    channel: ChannelName
}

export type ChannelsData = {
    selectedChannel?: ChannelName
    selectedChannelConfig?: ChannelConfig
    selectedChannelClient?: ChannelClient
    selectChannel: (channel: ChannelName) => void
}

const dummyComputeEngineInterface = {
    selectChannel: (channel: ChannelName) => {}
}

const ChannelsContext = React.createContext<ChannelsData>(dummyComputeEngineInterface)

export default ChannelsContext