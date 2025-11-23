import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Pressable,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

/**
 * AddNewConversation
 *
 * A reusable modal to start a new conversation.
 * - Supports quick actions (new group, new contact)
 * - Shows frequent contacts and phone contacts
 * - Optional selection mode via selectedIds/onToggleSelect props
 */
export default function AddNewConversation({
  visible,
  onClose,
  // actions
  onCreateGroup,
  onSelectContact,
  contacts = [], // [{ id, name, phone, avatar, inSystem }]
  // search
  search = '',
  onChangeSearch,
  // selection (optional controlled mode)
  selectedIds,
  onToggleSelect,
}) {
  const isSelectionEnabled = useMemo(
    () => Array.isArray(selectedIds) && typeof onToggleSelect === 'function',
    [selectedIds, onToggleSelect]
  );

  const renderContactRow = (item, { isSystemUser = false }) => (
    <TouchableOpacity
      key={item.id}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 18,
      }}
      onPress={() => {
        if (isSelectionEnabled) {
          onToggleSelect(item.id);
        } else if (typeof onSelectContact === 'function') {
          onSelectContact(item);
          if (typeof onClose === 'function') onClose();
        }
      }}
    >
      {isSelectionEnabled && (
        <View style={{ width: 28, alignItems: 'center', marginRight: 6 }}>
          <Ionicons
            name={selectedIds.includes(item.id) ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={selectedIds.includes(item.id) ? '#4CAF50' : '#bbb'}
          />
        </View>
      )}
      <View style={{
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
      }}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={{ width: 38, height: 38, borderRadius: 19 }} />
        ) : (
          <Ionicons name="person-circle-outline" size={36} color="#bbb" />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, color: '#222' }} numberOfLines={1}>
          {item.fullName || item.phone}
        </Text>
        {typeof item.lastMessage === 'string' && item.lastMessage.length > 0 ? (
          <Text style={{ fontSize: 13, color: '#888' }} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        ) : (
          !isSelectionEnabled && (
            <Text style={{ fontSize: 13, color: isSystemUser ? '#4CAF50' : '#888' }}>
              {isSystemUser ? 'Sur le système' : 'Inviter'}
            </Text>
          )
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={!!visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            paddingBottom: 24,
            paddingTop: 12,
            paddingHorizontal: 0,
            maxHeight: '90%',
          }}
          onPress={() => {}}
        >
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 18,
            paddingBottom: 8,
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#222' }}>Nouvelle discussion</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#222" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f2f2f2',
            borderRadius: 24,
            marginHorizontal: 16,
            marginBottom: 10,
            paddingHorizontal: 12,
            height: 40,
          }}>
            <Ionicons name="search" size={20} color="#888" />
            <TextInput
              style={{ flex: 1, marginLeft: 8, fontSize: 16, color: '#222', paddingVertical: 0 }}
              placeholder="Rechercher un nom ou un numéro"
              placeholderTextColor="#888"
              value={search}
              onChangeText={onChangeSearch}
              autoFocus
            />
          </View>

          {/* Quick actions */}
          <View style={{ marginBottom: 8 }}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 18 }}
              onPress={() => { onClose?.(); onCreateGroup?.(); }}
            >
              <View style={{
                backgroundColor: '#4CAF50',
                borderRadius: 24,
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Ionicons name="people-outline" size={22} color="#fff" />
              </View>
              <Text style={{ fontSize: 16, color: '#222' }}>Nouveau groupe</Text>
            </TouchableOpacity>
          </View>

          {/* Phone contacts */}
          <View>
            <Text style={{ fontSize: 14, color: '#888', fontWeight: '600', marginLeft: 18, marginBottom: 4, marginTop: 8 }}>
              Contacts
            </Text>
            <FlatList
              data={contacts}
              keyExtractor={(item) => String(item.id)}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => renderContactRow(item, { isSystemUser: !!item.inSystem })}
              style={{ maxHeight: 260 }}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: '#aaa', marginTop: 16, fontSize: 15 }}>
                  Aucun contact trouvé
                </Text>
              }
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
