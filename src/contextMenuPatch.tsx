//Credit: https://github.com/jessebofill/DeckWebBrowser

import { afterPatch, Dropdown, findInReactTree, findInTree, FooterLegendProps, getReactRoot, Export, findModuleByExport, findModuleExport, callOriginal, replacePatch, beforePatch, injectFCTrampoline, Patch, fakeRenderComponent, MenuItem, Navigation} from "@decky/ui"
import { Component, FC, ReactElement, ReactNode } from "react"
import { FaBluesky } from "react-icons/fa6"


import * as _ from "lodash";
import log from './log.ts';

export const shareNavigation = () => {
  const routePath = location.href;

  if (!routePath.includes(`https://steamloopback.host/routes/media/item/screenshot/`)){
    Navigation.Navigate("/decksky-share/")
  }

  else {
    let appIdHandle = routePath.replace("https://steamloopback.host/routes/media/item/screenshot/", "").split("_");
    let appId = parseInt(appIdHandle[0]);
    let handle = parseInt(appIdHandle[1]);
    console.log("contextMenuPatch: ", appId, handle);
    Navigation.Navigate(`/decksky-share/${appId}/${handle}`);
  }
}

const spliceArtworkItem = (options: any[]) => {
  const deckskyItem = _.cloneDeep(options[1]);
  deckskyItem.label = "Post to Bluesky...";
  deckskyItem.key = "decksky-share";
  deckskyItem.onSelected = () => {shareNavigation()};
  deckskyItem.icon.type = FaBluesky;
  options.splice(1, 0, deckskyItem);
};



const handleItemDupes = (items: any[]) => {
  const dskyIndex = items.findIndex((x: any) => x?.key === 'decksky-share');
  if (dskyIndex != -1) items.splice(dskyIndex, 1);
};

export const patchMenu = (ShareSheet: any) => {
  const patches: {
    patch?: Patch,
    unpatch: () => void;
  } = { unpatch: () => {return null;} };

    const trampolinedExport = injectFCTrampoline(ShareSheet);
    
      
    patches.patch = beforePatch(trampolinedExport, 'component', (args: any[]) => {
      if (args?.[0]?.children?.props?.options && args?.[0]?.children?.props?.options?.some((e: any) => e.key === 'sendmobile')) {
        let options = args[0].children.props.options;
        spliceArtworkItem(options);
      }
    })
    patches.unpatch = () => {patches.patch?.unpatch();};
    return patches;
  };

export const ShareSheet = Object.values(findModuleByExport((e: Export) => e?.toString && e.toString().includes('.ShareSheet'))).find((sibling) => (
    sibling?.toString().includes('.ContainerGamepad')
  )) as FC;

