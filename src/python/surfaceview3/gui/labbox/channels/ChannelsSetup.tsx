import React from 'react'
import { FunctionComponent } from "react"
import ChannelsContext from './ChannelsContext';
import useSetupChannels from './useSetupChannels';

const ChannelsSetup: FunctionComponent = (props) => {
    const channelsData = useSetupChannels()
    return (
        <ChannelsContext.Provider value={channelsData}>
            {props.children}
        </ChannelsContext.Provider>
    )
}

export default ChannelsSetup