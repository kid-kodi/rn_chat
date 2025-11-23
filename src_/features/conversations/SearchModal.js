import React, {useMemo, useState, useCallback, useEffect, useRef} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SectionList,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useApi} from '../../contexts/ApiProvider';
import CustomImageView from '../../components/CustomImage';

import {BASE_API_URL} from '@env';
import {navigate} from '../../common/utils/RootNavigation';

const defaultFilters = [
  {key: 'photos', icon: 'images-outline', label: 'Photos'},
  {key: 'documents', icon: 'document-text-outline', label: 'Documents'},
  {key: 'links', icon: 'link-outline', label: 'Liens'},
  {key: 'videos', icon: 'videocam-outline', label: 'Vidéos'},
  {key: 'gif', icon: 'color-filter-outline', label: 'GIF'},
  {key: 'audio', icon: 'musical-notes-outline', label: 'Audio'},
  {key: 'events', icon: 'calendar-outline', label: 'Événements'},
];

function formatTime(value) {
  if (!value) return '';
  try {
    const d = new Date(value);
    const now = new Date();
    if (now.toDateString() === d.toDateString()) {
      return d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    }
    return d.toLocaleDateString([], {month: 'short', day: 'numeric'});
  } catch {
    return String(value);
  }
}

function HighlightedText({text = '', query = '', style, highlightStyle}) {
  const parts = useMemo(() => {
    if (!query) return [text];
    const q = query.toLowerCase();
    const t = String(text);
    const out = [];
    let i = 0;
    while (i < t.length) {
      const idx = t.toLowerCase().indexOf(q, i);
      if (idx === -1) {
        out.push({s: t.slice(i), h: false});
        break;
      }
      if (idx > i) out.push({s: t.slice(i, idx), h: false});
      out.push({s: t.slice(idx, idx + q.length), h: true});
      i = idx + q.length;
    }
    return out;
  }, [text, query]);

  return (
    <Text style={style} numberOfLines={1}>
      {parts.map((p, idx) => (
        <Text
          key={idx}
          style={p.h ? [style, {fontWeight: '700'}, highlightStyle] : style}>
          {p.s}
        </Text>
      ))}
    </Text>
  );
}

export default function SearchModal({
  visible,
  onClose,
  placeholder = 'Rechercher…',
  emptyText = 'Aucun résultat',
}) {
  const api = useApi();
  const [query, setQuery] = useState('');
  const [sections, setSections] = useState([
    {key: 'conversations', title: 'Discussions', data: []},
    {key: 'messages', title: 'Messages', data: []},
    {key: 'contacts', title: 'Contacts', data: []},
  ]);
  const [loading, setLoading] = useState(false);

  // Only show sections with data length not equal to zero
  const filteredSections = useMemo(
    () =>
      Array.isArray(sections)
        ? sections.filter(s => Array.isArray(s.data) && s.data.length !== 0)
        : [],
    [sections],
  );

  // Search function implemented here
  const handleSearch = useCallback(
    async q => {
      if (!q || !q.trim()) {
        setSections([
          {key: 'conversations', title: 'Discussions', data: []},
          {key: 'messages', title: 'Messages', data: []},
          {key: 'contacts', title: 'Contacts', data: []},
        ]);
        return;
      }
      setLoading(true);
      api
        .get(`/api/search?q=${encodeURIComponent(q)}`)
        .then(res => {
          // Assume res.data is { messages: [], contacts: [], conversations: [] }
          setSections([
            {
              key: 'conversations',
              title: 'Discussions',
              data: res.conversations || [],
            },
            {key: 'messages', title: 'Messages', data: res.messages || []},
            {key: 'contacts', title: 'Contacts', data: res.contacts || []},
          ]);
        })
        .catch(err => {
          // Optionally handle error, e.g. setSections to empty
          setSections([
            {key: 'conversations', title: 'Discussions', data: []},
            {key: 'messages', title: 'Messages', data: []},
            {key: 'contacts', title: 'Contacts', data: []},
          ]);
        })
        .finally(() => setLoading(false));
    },
    [api],
  );

  // Debounce logic
  const debounceTimeout = useRef();

  // Handle input change and debounce search
  const handleChangeQuery = useCallback(text => {
    setQuery(text);
  }, []);

  useEffect(() => {
    // Debounce: wait 400ms after user stops typing
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    if (query && query.trim()) {
      debounceTimeout.current = setTimeout(() => {
        handleSearch(query);
      }, 400);
    } else {
      // If query is empty, clear results immediately
      handleSearch('');
    }
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [query, handleSearch]);

  // Handle submit (search) - immediate search
  const handleSubmitQuery = useCallback(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    handleSearch(query);
  }, [handleSearch, query]);

  // Implement onPress depending on the type
  const handleItemPress = useCallback(
    item => {
      if (!item) return;
      if (item.type === 'messages') {
        onClose();
        // For messages, pass the message and indicate it's a message search result
        navigate('CHAT', {
          type: 'message',
          messageId: item.id,
          chatId: item.chatId,
          ...item,
        });
      } else if (item.type === 'contacts') {
        onClose();
        // For contacts, pass the user/contact
        navigate('CONTACT', {
          type: 'contact',
          userId: item.id,
          ...item,
        });
      } else if (item.type === 'conversations') {
        onClose();
        // For conversations, pass the chat/conversation
        navigate('CHAT', {
          type: 'conversation',
          chatId: item.id,
          ...item,
        });
      }
    },
    [],
  );

  return (
    <Modal
      visible={!!visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.25)'}}>
        <TouchableOpacity
          style={{flex: 1}}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '98%',
            minHeight: '98%',
            paddingBottom: 8,
          }}>
          {/* Header: Back, Search, Send */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingTop: 10,
            }}>
            <TouchableOpacity
              onPress={onClose}
              style={{padding: 6, marginRight: 6}}>
              <Ionicons name="arrow-back" size={22} color="#222" />
            </TouchableOpacity>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f2f2f2',
                borderRadius: 20,
                paddingHorizontal: 10,
                height: 38,
              }}>
              <Ionicons name="search" size={18} color="#888" />
              <TextInput
                style={{
                  flex: 1,
                  marginLeft: 8,
                  color: '#222',
                  paddingVertical: 0,
                }}
                placeholder={placeholder}
                placeholderTextColor="#888"
                value={query}
                onChangeText={handleChangeQuery}
                returnKeyType="search"
                autoFocus
                onSubmitEditing={handleSubmitQuery}
              />
            </View>
            <TouchableOpacity
              onPress={handleSubmitQuery}
              style={{padding: 6, marginLeft: 8}}>
              <Ionicons name="send" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* Filters */}
          {/* {!!filters?.length && (
            <View style={{paddingHorizontal: 8, paddingTop: 10}}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{flexDirection: 'row', alignItems: 'center'}}
              >
                {filters.map(f => {
                  const isActive = filter === f.key;
                  return (
                    <TouchableOpacity
                      key={f.key}
                      onPress={() => onPressFilter?.(f.key)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: isActive ? '#007AFF22' : '#f7f7f7',
                        borderRadius: 18,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        marginRight: 8,
                        borderWidth: isActive ? 1.5 : 0,
                        borderColor: isActive ? '#007AFF' : 'transparent',
                      }}>
                      <Ionicons name={f.icon} size={18} color={isActive ? '#007AFF' : '#555'} />
                      <Text style={{
                        marginLeft: 6,
                        color: isActive ? '#007AFF' : '#333',
                        fontSize: 14,
                        fontWeight: isActive ? 'bold' : 'normal',
                      }}>
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )} */}

          {/* Results */}
          <View style={{flex: 1, paddingTop: 6}}>
            {loading ? (
              <View style={{alignItems: 'center', marginTop: 30}}>
                <ActivityIndicator size="small" color="#007AFF" />
              </View>
            ) : (
              <SectionList
                sections={filteredSections}
                keyExtractor={item => String(item.id)}
                renderSectionHeader={({section}) =>
                  section.title ? (
                    <View style={{paddingHorizontal: 16, paddingVertical: 6}}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '600',
                          color: '#777',
                        }}>
                        {section.title}
                      </Text>
                    </View>
                  ) : null
                }
                renderItem={({item}) => (
                  <TouchableOpacity
                    onPress={() => handleItemPress(item)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                    }}>
                    {/* Avatar or icon */}
                    <View style={{marginRight: 12}}>
                      <CustomImageView
                        source={`${BASE_API_URL}/image/${item.avatar}`}
                        firstName={item.title}
                        size={40}
                        fontSize={20}
                      />
                    </View>
                    {/* Main */}
                    <View style={{flex: 1}}>
                      <HighlightedText
                        text={item.title}
                        query={query}
                        style={{fontSize: 15, color: '#111'}}
                      />
                      {!!item.subtitle && (
                        <HighlightedText
                          text={item.subtitle}
                          query={query}
                          style={{fontSize: 13, color: '#666', marginTop: 2}}
                        />
                      )}
                    </View>
                    {/* Right meta */}
                    {!!item.time && (
                      <Text
                        style={{fontSize: 12, color: '#888', marginLeft: 8}}>
                        {formatTime(item.time)}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text
                    style={{textAlign: 'center', color: '#999', marginTop: 24}}>
                    {emptyText}
                  </Text>
                }
                stickySectionHeadersEnabled={false}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
