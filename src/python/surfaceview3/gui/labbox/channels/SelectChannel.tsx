import { Button, TextField } from '@material-ui/core'
import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { FunctionComponent } from "react"
import useChannels from './useChannels'
import ChannelsTable, { getChannelConfig } from '../ApplicationBar/ChannelsTable'
import channelItemsReducer, { initialChannelItems } from '../ApplicationBar/channelItemsReducer'
import { ChannelName, isChannelName } from '../types/kacheryTypes'

type Props = {
    onClose: () => void
}

const SelectChannel: FunctionComponent<Props> = ({onClose}) => {
    const {
        selectedChannel,
        selectChannel
    } = useChannels()
    
    const [channelItems, channelItemsDispatch] = useReducer(channelItemsReducer, initialChannelItems())

    const [editChannel, setEditChannel] = useState<string>('')
    useEffect(() => {
        setEditChannel(selectedChannel?.toString() || '')
    }, [selectedChannel])
    const handleChange = useCallback((evt: any) => {
        const val: string = evt.target.value
        setEditChannel(val)
    }, [])
    const handleSelectChannel = useCallback((channel: ChannelName) => {
        getChannelConfig(channel).then(config => {
            channelItemsDispatch({
                type: 'addItem',
                item: {
                    channel,
                    lastUsed: Number(new Date())
                }
            })
            selectChannel(channel)
            onClose()
        })
    }, [selectChannel, onClose])
    const handleOkay = useCallback(() => {
        if (!editChannel) return
        if (!isChannelName(editChannel)) return
        handleSelectChannel(editChannel)
    }, [handleSelectChannel, editChannel])
    const handleKeyDown = useCallback((e: any) => {
        if (e.keyCode === 13) {
           handleOkay()
        }
    }, [handleOkay])
    return (
        <div>
            <h3>Select a backend provider</h3>
            <TextField style={{width: '100%'}} label="Channel" value={editChannel} onChange={handleChange} onKeyDown={handleKeyDown} />
            <Button onClick={handleOkay} disabled={editChannel === (selectedChannel || '').toString()}>Set backend provider</Button>
            <ChannelsTable
                channelItems={channelItems}
                channelItemsDispatch={channelItemsDispatch}
                selectedChannel={editChannel as any as ChannelName}
                onSelectChannel={handleSelectChannel}
            />
        </div>
    )
}

export default SelectChannel