import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Modal,
    TextInput,
} from 'react-native';

const ChatScreen = () => {
    const allUsers = [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
        { id: '3', name: 'Charlie' },
        { id: '4', name: 'Diana' },
        { id: '5', name: 'Ethan' },
        { id: '6', name: 'Fatima' },
    ];

    const [groupUsers, setGroupUsers] = useState([
        { id: '1', name: 'Alice', role: 'admin' },
    ]);

    const [modalVisible, setModalVisible] = useState(false);
    const [search, setSearch] = useState('');

    const groupUserIds = groupUsers.map(u => u.id);
    const availableUsers = allUsers.filter(
        user =>
            !groupUserIds.includes(user.id) &&
            user.name.toLowerCase().includes(search.toLowerCase())
    );

    const addUserToGroup = (user) => {
        setGroupUsers([...groupUsers, { ...user, role: 'member' }]);
    };

    const removeUserFromGroup = (id) => {
        setGroupUsers(groupUsers.filter(user => user.id !== id));
    };

    const renderGroupUser = ({ item }) => (
        <View style={styles.userRow}>
            <Text style={styles.userName}>{item.name} ({item.role})</Text>
            {item.role !== 'admin' && (
                <TouchableOpacity onPress={() => removeUserFromGroup(item.id)}>
                    <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderAvailableUser = ({ item }) => (
        <TouchableOpacity style={styles.userRow} onPress={() => {
            addUserToGroup(item);
            setModalVisible(false);
            setSearch('');
        }}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.addText}>Add</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Group Members</Text>
                <TouchableOpacity mode="outlined" onPress={() => setModalVisible(true)}>
                    <Text>Add User</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={groupUsers}
                keyExtractor={item => item.id}
                renderItem={renderGroupUser}
                ListEmptyComponent={<Text>No group members</Text>}
                style={styles.list}
            />

            <TouchableOpacity mode="text" style={styles.leaveBtn} onPress={() => alert('Left the group')}>
                <Text>
                    Leave Group</Text>
            </TouchableOpacity>

            {/* Modal for Adding Users */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add User to Group</Text>

                        <TextInput
                            label="Search users"
                            value={search}
                            onChangeText={setSearch}
                            style={styles.input}
                        />

                        <FlatList
                            data={availableUsers}
                            keyExtractor={item => item.id}
                            renderItem={renderAvailableUser}
                            ListEmptyComponent={<Text style={{ padding: 10 }}>No users found</Text>}
                            style={styles.list}
                        />

                        <TouchableOpacity onPress={() => {
                            setModalVisible(false);
                            setSearch('');
                        }}>
                            <Text>
                                Close</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ChatScreen;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    title: { fontSize: 20, fontWeight: 'bold' },
    list: { marginVertical: 10 },
    userRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderColor: '#ccc',
    },
    userName: { fontSize: 16 },
    addText: { color: 'green', fontWeight: '600' },
    removeText: { color: 'red', fontWeight: '600' },
    leaveBtn: { marginTop: 20, alignSelf: 'center' },
    modalContainer: {
        flex: 1,
        backgroundColor: '#000000aa',
        justifyContent: 'center',
    },
    modalContent: {
        margin: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 20,
        maxHeight: '80%',
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
    input: { marginBottom: 12 },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
