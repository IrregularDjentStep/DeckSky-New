import {
  useEffect,
  useState,
  FC,
  FormEvent,
  useRef,
  useReducer,
  useCallback
} from 'react';

import {
  Focusable,
  Dropdown,
  showModal,
  Spinner,
  TextField,
  DialogButton,
  findSP,
  useParams
} from '@decky/ui';


export const ScreenshotUploadPage: FC = () => {

  const PAGE_SIZE = 30;
  const [screenshotPath, setScreenshotPath] = useState<string>('');
  const {appId, handle} = useParams<{ appId: number, handle: number}>();
  
  useEffect(() => {
    const getScreenshotPath = async () => {
      try {
        const path = await SteamClient?.Screenshots?.GetLocalScreenshotPath(appId, handle).then()
        setScreenshotPath(path)
        console.log(screenshotPath);
      } catch (error){
        console.log("error in gettting screenshot path: ", error);
      };
  }
}, [appId, handle])

  
  return (
    <div>
       <img src={screenshotPath}></img>
    </div>
  );
};