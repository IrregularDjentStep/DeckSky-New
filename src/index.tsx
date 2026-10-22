import {
  DialogButton,
  PanelSection,
  PanelSectionRow,
  TextField,
  staticClasses,
  showModal,
  ShowModalResult,
  Navigation,
  afterPatch,
  wrapReactType,
  createReactTreePatcher,
  findInReactTree,
  gamepadUIClasses,
  findModuleExport,
  Export,
  findInTree,
  fakeRenderComponent,
  
} from "@decky/ui";
import {
  addEventListener,
  removeEventListener,
  definePlugin,
  toaster,
  routerHook
} from "@decky/api"
import { useState, ReactElement } from "react";
import { FaShip } from "react-icons/fa";
import {patchMenu, ShareSheet} from './contextMenuPatch.tsx';
import LoginModal from './components/LoginModal.tsx';
import { createNewClient } from "./auth/client.ts";
import { stopObserving, startObserving, isObserverRoute } from './observer.ts'
import {
    AtprotoDohHandleResolver,
    BrowserOAuthClient
} from '@atproto/oauth-client-browser'
import { ScreenshotUploadPage } from "./components/ScreenshotUploadPage.tsx";
// import logo from "../assets/logo.png";
const redirect_uri = `${window.location.origin}/decksky-callback`
const client = await BrowserOAuthClient.load({
        handleResolver: new AtprotoDohHandleResolver({dohEndpoint: 'https://dns.google/resolve'}),
        //TODO: replace with production version
        clientId:  `https://irregulardjentstep.github.io/oauth-client-metadata.json`,
        
    });
await client.init();


function Content() {
  const [modalResult, setModalResult] = useState<ShowModalResult | null>(null);
  // how to set different handle resolvers for different users?
  

  //closes the current modal
  const closeModal = () => {
    modalResult?.Close();
    setModalResult(null);
  }


  const openLoginModal = () => {
    console.log(redirect_uri);
    const result = showModal(<LoginModal client={client} closeModal={closeModal} />);
    setModalResult(result);
    
  }


  // if there are no accounts added, show this

  //otherwise, show every logged-in BSKY account
  return <PanelSection title="Bluesky Accounts">
      <PanelSectionRow>
         <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          paddingLeft: "15px",
        }}
      >
        No accounts have been added yet. To begin, add an account below.
        </div>
        <DialogButton
          onClick={openLoginModal}
        >
          "Add New Account..."
        </DialogButton>
      </PanelSectionRow>

      {/* <PanelSectionRow>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img src={logo} />
        </div>
      </PanelSectionRow> */}

      {/*<PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            Navigation.Navigate("/decky-plugin-test");
            Navigation.CloseSideMenus();
          }}

        >
          Router
        </ButtonItem>
      </PanelSectionRow>*/}
    </PanelSection>;
};

export default definePlugin(() => {
  console.log("Template plugin initializing, this is called once on frontend startup");
  routerHook.addRoute('/decksky-share/:appId/:handle', () => (
        <ScreenshotUploadPage/>
  ), {
    exact: true,
  });

  const unpatchMenu = patchMenu(ShareSheet);


 /*  const screenshotPatch = routerHook.addPatch('/media', (tree: any) => {
      console.log("PATCH /media triggered");
      console.log("Full tree object for screenshot:", tree);

      

      const routeProps = findInReactTree(tree, (x: any) => x?.type);
      console.log("routeProps with type:", routeProps, typeof routeProps.type);

      if (routeProps) {
        afterPatch(routeProps, "type", (args: any[], ret: ReactElement) => {
          // 'ret' is the rendered React element tree
          // Mutate it here before React reconciles
          console.log("ret1 -> ", ret);


          //ret2 time
          afterPatch(ret, "type", (args: any[], ret2: ReactElement) => {
            // 'ret' is the rendered React element tree
            // Mutate it here before React reconciles
            console.log("ret2 -> ", ret2);

            //TODO:RET3 go down PROPS.CHILDREN THIS TIME (going down forwardref didnt work)
            afterPatch(ret2.type, "render", (args: any[], ret3: ReactElement) => {
              // 'ret' is the rendered React element tree
              // Mutate it here before React reconciles
              console.log("ret3 -> ", ret3);

              //path 1: go as deep down into 
              afterPatch(ret3.type, "type", (args: any[], ret4: ReactElement) => {
                console.log("ret4 ->", ret4);
              });

              return ret3;
            });

            return ret2;
          });

          return ret;
        });
      } else {
        console.log("routeProps not found.");
      }
      return tree;
    }); */



  return {
    // The name shown in various decky menus
    name: "DeckSkyRewrite",
    // The element displayed at the top of your plugin's menu
    titleView: <div className={staticClasses.Title}>DeckSky</div>,
    // The content of your plugin's menu
    content: <Content />,
    // The icon displayed in the plugin list
    icon: <FaShip />,
    // The function triggered when your plugin unloads
    onDismount() {
      console.log("Unloading")
      routerHook.removeRoute(`/decksky-share`);
      unpatchMenu?.unpatch();
    }
}
});