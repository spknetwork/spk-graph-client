import { TileDocument } from "@ceramicnetwork/stream-tile";
import { SocialConnection, SpkClient } from ".";

function deserializeConnection() {
    
}
function serializeConnection() {

}

export class SocialConnections {
    client: SpkClient;
    constructor(client:SpkClient) {
        this.client = client;
    }

    async list() {
        const connections:Record<string, SocialConnection> = await this.client.idx.get('socialConnectionIndex') || {}
        return Object.values(connections).map(e => {
            //Parse ISO time to Date object
            if(e.created_at) {
                e.created_at = new Date(e.created_at)
            }
            return e;
        })
    }

    async follow(did: string) {
        const connections:Record<string, SocialConnection> = await this.client.idx.get('socialConnectionIndex') || {};
        const key = `follow@${did}`; //Keys have no relevance in practice.. Iterate through index
        let alreadyExisting = false;
        for(let record of Object.values(connections)) {
            console.log(record)
            if(record.target === did) {
                alreadyExisting = true
            }
        }
        if(alreadyExisting) {
            throw new Error('Already following')
        }
        connections[key] = {
            target: did,
            target_type: 'did',
            created_at: new Date().toISOString() as any
        }
        await this.client.idx.set('socialConnectionIndex', connections)
    }

    async unfollow(did: string) {
        const connections:Record<string, SocialConnection> = await this.client.idx.get('socialConnectionIndex') || {};
        for(let [key, record] of Object.entries(connections)) {
            if(record.target === did) {
                delete connections[key]
            }
        }
        await this.client.idx.set('socialConnectionIndex', connections)
    }


    /**
     * NOTICE: this is experimental. Do NOT use in production without properly evaluation
     * Takes a snapshot of the IDX record then recreates it with a new stream tile.
     * Used for reducing the oplog length back to near 0 (lower sync times, less overhead)
     * @todo
     * 
     */
    protected async snapshot(args?: {unpin?: boolean}) {
        const ownDoc = await this.client.idx._getOwnIDXDoc()
        console.log(ownDoc.content, ownDoc.id.toString())
        const aliasId = this.client.idx._aliases['socialConnectionIndex']
        console.log(aliasId)
        const oldId = ownDoc[aliasId];
        const connectionsContent = await this.client.idx.get('socialConnectionIndex');
        console.log(connectionsContent)
        const tileDoc = await TileDocument.create(this.client.idx.ceramic, connectionsContent, {
            family: aliasId
        })
        const ownDocContent = ownDoc.content || {}; 
        ownDocContent[aliasId] = tileDoc.id.toUrl()
        console.log(ownDoc)

        if(args?.unpin) {
            await this.client.idx.ceramic.pin.rm(oldId)
        }
        await ownDoc.update(ownDocContent)
    }
    
    /**
     * Gets a list of your followers or followers of specified DID. Only discoverable if followers have been announced to indexer
     * @param did 
     * @todo WIP
     */
    async followers(did?: string) {

    }

    /**
     * Announces to an indexer node about changes in the social connections record
     */
    async announce() {

    }
}