import { FeedId, FeedName, PrivateKey, SignedSubfeedMessage, SubfeedHash } from "../kachery-js/types/kacheryTypes";
import GarbageMap from "../kachery-js/util/GarbageMap";

class LocalSubfeed {
    #signedMessages: SignedSubfeedMessage[] = []
    async getSignedMessages(): Promise<SignedSubfeedMessage[]> {
        return this.#signedMessages
    }
    async appendSignedMessages(messages: SignedSubfeedMessage[]) : Promise<void> {
        for (let m of messages) {
            this.#signedMessages.push(m)
        }
    }
}

class LocalFeed {
    #subfeeds = new GarbageMap<SubfeedHash, LocalSubfeed>(null)
    getSubfeed(subfeedHash: SubfeedHash) {
        if (!this.#subfeeds.has(subfeedHash)) {
            this.#subfeeds.set(subfeedHash, new LocalSubfeed())
        }
        const sf = this.#subfeeds.get(subfeedHash)
        if (!sf) throw Error('No local subfeed')
        return sf
    }
}

class BrowserLocalFeedManager {
    #localFeeds = new GarbageMap<FeedId, LocalFeed>(null)
    async createFeed(feedName: FeedName | null) : Promise<FeedId> {
        throw Error('not implemented')
    }
    async deleteFeed(feedId: FeedId) : Promise<void> {
        throw Error('not implemented')
    }
    async getFeedId(feedName: FeedName) : Promise<FeedId | null> {
        return null
    }
    async hasWriteableFeed(feedId: FeedId) : Promise<boolean> {
        return false
    }
    async getPrivateKeyForFeed(feedId: FeedId) : Promise<PrivateKey | null> {
        return null
    }
    async feedExistsLocally(feedId: FeedId) : Promise<boolean> {
        return this.#localFeeds.has(feedId)
    }
    async getSignedSubfeedMessages(feedId: FeedId, subfeedHash: SubfeedHash) : Promise<SignedSubfeedMessage[]> {
        if (!this.#localFeeds.has(feedId)) {
            this.#localFeeds.set(feedId, new LocalFeed())
        }
        const f = this.#localFeeds.get(feedId)
        if (!f) throw Error(`No local feed: ${feedId}`)
        const sf = f.getSubfeed(subfeedHash)
        return await sf.getSignedMessages()
    }
    async appendSignedMessagesToSubfeed(feedId: FeedId, subfeedHash: SubfeedHash, messages: SignedSubfeedMessage[]) : Promise<void> {
        const f = this.#localFeeds.get(feedId)
        if (!f) throw Error(`No local feed: ${feedId}`)
        const sf = f.getSubfeed(subfeedHash)
        if (!sf) throw Error(`No local subfeed: ${feedId}/${subfeedHash}`)
        await sf.appendSignedMessages(messages)
    }
}

export default BrowserLocalFeedManager