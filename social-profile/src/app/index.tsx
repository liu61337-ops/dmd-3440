import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const POSTS = [
  { id: '1', title: 'Studio session', image: 'https://picsum.photos/400/300?random=1' },
  { id: '2', title: 'Live at Storrs', image: 'https://picsum.photos/400/300?random=2' },
  { id: '3', title: 'New merch drop', image: 'https://picsum.photos/400/300?random=3' },
];

function PostCard({ title, image }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: image }} style={styles.cardImage} />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  );
}

function FollowButton() {
  const [following, setFollowing] = useState(false);
  return (
    <Pressable
      onPress={() => setFollowing(!following)}
      style={[styles.button, following && styles.buttonActive]}
    >
      <Text style={styles.buttonText}>{following ? 'Following' : 'Follow'}</Text>
    </Pressable>
  );
}

export default function Index() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://picsum.photos/200?random=10' }}
          style={styles.avatar}
        />
        <View style={styles.headerText}>
          <Text style={styles.name}>Alex Chen</Text>
          <Text style={styles.bio}>DMD · Photography & design</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>127</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>4.2k</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>380</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <FollowButton />
      </View>
      <TextInput
        placeholder="Search posts..."
        style={styles.search}
        placeholderTextColor="#999"
      />

      {POSTS.map((post) => (
        <PostCard key={post.id} title={post.title} image={post.image} />
      ))}

    </ScrollView>

  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 12,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  bio: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },

  actions: {
    padding: 16,
  },
  button: {
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 48,
  },
  buttonActive: {
    backgroundColor: '#333',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  search: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },

});