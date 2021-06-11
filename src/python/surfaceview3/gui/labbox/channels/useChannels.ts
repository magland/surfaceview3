import { useContext } from "react"
import ChannelsContext from './ChannelsContext'

const useChannels = () => {
    return useContext(ChannelsContext)
}

export const useChannelClient = () => {
    return useChannels().selectedChannelClient
}

export default useChannels