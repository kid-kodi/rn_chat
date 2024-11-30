import { useEffect, useState } from "react";
import { PanResponderSubtitle } from "../core/components/PanResponderSubtitle";
import { MeetingVariable } from "../MeetingVariable";

export default Subtitle = ({maxWidth, maxHeight}) => {
    const [contents, setContents] = useState(null);
  
    useEffect(() => {
      MeetingVariable.speechRecognition.registerSpeechListener(
        'speech',
        updateSubtitle,
      );
      return () => {
        MeetingVariable.speechRecognition.deleteSpeechListener('speech');
      };
    }, []);
  
    const updateSubtitle = string => {
      setContents(string);
    };
  
    return (
      <PanResponderSubtitle
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        text={contents}
      />
    );
  };