import { useCallback, useMemo } from "react"
import useRoute from "../../route/useRoute"
import useGoogleSignInClient from "../googleSignIn/useGoogleSignInClient"
import createObjectStorageClient from "../objectStorage/createObjectStorageClient"
import { ChannelName, urlString, UrlString } from "../types/kacheryTypes"
import ChannelClient from "./ChannelClient"
import { ChannelsData } from "./ChannelsContext"

type ChannelConfig = {
    channel: ChannelName
    objectStorageUrl: UrlString
}

const useSetupChannels = (): ChannelsData => {
    const {channel, setRoute} = useRoute()

    const googleSignInClient = useGoogleSignInClient()

    const selectedChannelConfig = useMemo((): ChannelConfig | undefined => (
        channel ? ({
            channel,
            objectStorageUrl: urlString('https://test')
        }) : undefined
    ), [channel])

    const selectedChannelClient = useMemo(() => {
        if ((!channel) || (!selectedChannelConfig) || (!googleSignInClient)) return undefined
        const objectStorageClient = createObjectStorageClient({http: {baseUrl: selectedChannelConfig.objectStorageUrl}})
        const X = new ChannelClient(channel, objectStorageClient, googleSignInClient)
        return X
    }, [channel, selectedChannelConfig, googleSignInClient])

    const selectChannel = useCallback((channel: ChannelName) => {
        setRoute({channel: channel})
        // setRegistration(undefined)
    }, [setRoute])

    return {
        selectedChannel: channel,
        selectedChannelConfig,
        selectedChannelClient,
        selectChannel
    }

    // const [registration, setRegistration] = useState<RegistrationResult | null | undefined>(undefined)
    // const googleSignInClient = useGoogleSignInClient()

    // useEffect(() => {
    //     if ((channel) && (registration === undefined)) {
    //         setRegistration(null)
    //         ;(async () => {
    //             const req0: RegisterRequest = {type: 'registerClient', channel: channel, appName: packageName}
    //             const registrationResult: RegistrationResult = (await axios.post('/api/register', req0)).data
    //             setRegistration(registrationResult || null)
    //         })()
    //     }
    // }, [channel, registration])

    // const selectedChannelConfig = useMemo((): ChannelConfig | undefined => (
    //     registration && channel ? ({
    //         channel: channel,
    //         objectStorageUrl: registration.channelConfig.objectStorageUrl
    //     }) : undefined
    // ), [registration, channel])

    // const selectedChannelClient = useMemo(() => {
    //     if ((!channel) || (!registration) || (!selectedChannelConfig)) return undefined
    //     const objectStorageClient = createObjectStorageClient({http: {baseUrl: selectedChannelConfig.objectStorageUrl}})
    //     const ablyClient = createPubsubClient({ably: {token: registration.tokenDetails.token}})
    //     const clientChannel = ablyClient.getChannel(registration.clientChannelName)
    //     const serverChannel = ablyClient.getChannel(registration.serverChannelName)
    //     const X = new ChannelClient(channel, clientChannel, serverChannel, objectStorageClient, googleSignInClient)
    //     return X
    // }, [channel, registration, selectedChannelConfig, googleSignInClient])

    // const selectChannel = useCallback((channel: string) => {
    //     setRoute({channel: channel})
    //     setRegistration(undefined)
    // }, [setRoute, setRegistration])
    
    // return useMemo((): ChannelsData => ({
    //     selectedChannel: channel,
    //     selectedChannelConfig,
    //     selectedChannelClient,
    //     selectChannel
    // }), [channel, selectedChannelConfig, selectedChannelClient, selectChannel])
}

export default useSetupChannels