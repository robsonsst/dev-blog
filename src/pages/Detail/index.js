import React, { useEffect, useState, useLayoutEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

import {
  SafeAreaView,
  Image,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Modal,
} from 'react-native';

import { Feather, Entypo } from '@expo/vector-icons';

import api from '../../services/api';
import LinkWeb from '../../components/LinkWeb';

export default function Detail() {
  const [post, setPost] = useState({});
  const [links, setLinks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [openLink, setOpenLink] = useState({});

  const route = useRoute();
  const navigation = useNavigation();

  //Pega os posts
  useEffect(() => {
    async function getPost() {
      const response = await api.get(
        `api/posts/${route.params?.id}?populate=cover,category,options`
      );

      setPost(response.data.data);
      setLinks(response.data?.data?.attributes?.options);
    }

    getPost();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleShare}>
          <Entypo name="share" size={25} color="#FFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, post]);

  //Compartilha o post
  async function handleShare() {
    try {
      const result = await Share.share({
        message: `
          Confere esse post: ${post?.attributes?.title}

          ${post?.attributes?.description}

          Vi lá no app DevBlog!
        `,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('ACTIVITY TYPE');
        } else {
          console.log('COMPARTILHADO');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('MODAL FECHADO');
      }
    } catch (e) {
      console.log('Erro em handleShare' + e);
    }
  }

  //Abre modal com o link
  function handleOpenLink(link) {
    setModalVisible(true);
    setOpenLink(link);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image
        resizeMode="cover"
        style={styles.cover}
        source={{
          uri: `http://10.0.0.108:1337${post?.attributes?.cover?.data?.attributes?.url}`,
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{post?.attributes?.title}</Text>
        <Text style={styles.description}>{post?.attributes?.description}</Text>

        {links.length > 0 && <Text style={styles.subTitle}>Links</Text>}

        {links.map((link) => (
          <TouchableOpacity
            key={link.id}
            style={styles.linkButton}
            onPress={() => handleOpenLink(link)}
          >
            <Feather name="link" color="#1e4687" size={14} />
            <Text style={styles.linkText}>{link.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal animationType="slide" visible={modalVisible} transparent={true}>
        <LinkWeb
          link={openLink?.url}
          title={openLink?.name}
          closeModal={() => setModalVisible(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  cover: {
    width: '100%',
    height: 230,
  },
  content: {
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
    marginTop: 18,
  },
  description: {
    lineHeight: 20,
  },
  subTitle: {
    fontWeight: 'bold',
    marginTop: 14,
    marginBottom: 6,
    fontSize: 18,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  linkText: {
    color: '#1e4687',
    fontSize: 16,
    marginLeft: 6,
  },
});
