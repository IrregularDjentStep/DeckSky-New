
import { ConfirmModal, DialogBody, Focusable, TextField, Navigation} from "@decky/ui";
import { useState } from "react";
import { BrowserOAuthClient } from "@atproto/oauth-client-browser";
import { resolveIdentity } from "../auth/client.ts";


const LoginModal: React.FC<{ client: BrowserOAuthClient, closeModal: () => void}> = ({client, closeModal}) =>{

    const [bOKDisabled, setBOKDisabled] = useState<boolean>(true);
    const [handle, setHandle] = useState<string>('');

    async function loginHandler(handle: string){
          try {
          
            const url = await client.authorize(handle, {
              state: "423142", //TODO: figure out how to do states
              scope: 'atproto',
            });

            console.log(url.toString());
      
            Navigation.NavigateToExternalWeb(url.toString());
          } catch (error) {
            throw error;
          }
      
    }
    

    return (
        <ConfirmModal
      strTitle="Login to Bluesky"
      strDescription="Please enter your Bluesky username."
      strOKButtonText="Login"
      bOKDisabled={bOKDisabled}
      onCancel={closeModal}
      onOK={() => {
        loginHandler(handle)
        closeModal();
      }}>
        <DialogBody>
            <Focusable>
                <TextField
                label="Your Bluesky username"
                onChange={(e) =>
                    {
                      setBOKDisabled(e.target.value.trim().length == 0)
                      setHandle(e.target.value);
                    }
                }>

                </TextField>
            </Focusable>
        </DialogBody>
      </ConfirmModal>
    )
}

export default LoginModal;