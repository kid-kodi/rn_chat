import Video from 'react-native-video';

export default ({videoUri}) => (
  <Video
    source={{ uri: videoUri}}
    style={{ width: '100%', aspectRatio: 16 / 9 }}
    controls
  />
);