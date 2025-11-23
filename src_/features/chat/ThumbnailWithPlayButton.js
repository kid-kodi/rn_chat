import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'

import { createThumbnail } from "react-native-create-thumbnail";

export default function ThumbnailWithPlayButton({ uri:videoUri }) {

	const [thumbnailUri, setThumbnailUri] = useState(null);

	useEffect(() => {
		const generateThumbnail = async () => {
			try {
				const response = await createThumbnail({
					url: videoUri,
					timeStamp: 1000, // 1 second
				});
				console.log(response)
				setThumbnailUri(response.path);
			} catch (err) {
				console.log('Thumbnail error:', err);
			}
		};

		generateThumbnail();
	}, []);

	return (
		<View>
			<Text>ThumbnailWithPlayButton</Text>
		</View>
	)
}

const styles = StyleSheet.create({})