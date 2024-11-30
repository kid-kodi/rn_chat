import { View, Text, FlatList } from 'react-native'
import React, { useEffect } from 'react'
import Screen from './components/Screen';
import DataItem from './components/DataItem';

export default function DataList(props) {
    const { title, type, data, chat } = props.route.params;

    useEffect(() => {
        props.navigation.setOptions({ headerTitle: title })
    }, [title])

    return (
        <Screen>
            <FlatList
                data={data}
                keyExtractor={item => item._id}
                renderItem={({ item }) => {
                    return <DataItem
                        image={item.profilePicture}
                        title={item.fullName}
                        subTitle={item.about}
                        onPress={
                            () => props.navigation.navigate("CONTACT",
                                {
                                    currentUser: item,
                                    chat
                                })
                        }
                        type="link"
                    />
                }}
            />
        </Screen>
    )
}