import {BrowserOAuthClient, AtprotoDohHandleResolver, atprotoLoopbackClientMetadata } from '@atproto/oauth-client-browser'
import { isValidHandle } from "@atproto/syntax";


export async function createNewClient (){
  let clientId = `http://localhost?redirect_uri=${encodeURIComponent('http://127.0.0.1:8080/callback')}&scope=${encodeURIComponent('atproto transition:generic')}`;
  
  return new BrowserOAuthClient({
      handleResolver: new AtprotoDohHandleResolver({dohEndpoint: 'https://dns.google/resolve'}),
      // This object will be used to build the payload of the /client-metadata.json
      // endpoint metadata, exposing the client metadata to the OAuth server.
      clientMetadata: atprotoLoopbackClientMetadata(clientId)
  })
}



export async function resolveIdentity (handle: string): Promise<string | null>{
      // make an api call to bluesky to see if it is successful

      if (!isValidHandle(handle)) {
        return "Invalid handle format";
      }

      const response = await fetch(
        `https://slingshot.microcosm.blue/xrpc/com.bad-example.identity.resolveMiniDoc?identifier=${handle}`
      );

      // if not, return null
      if (!response.ok){
        return null!;
      }

      //
      const data = await response.json() as { did: string, handle: string, pds: string, signing_key: string};
      return data.pds;
}