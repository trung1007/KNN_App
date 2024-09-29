import { Image, StyleSheet, Platform } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useEffect } from 'react';

export default function HomeScreen() {
  const KNN = require('ml-knn');
  var train_dataset = [
    [0, 0, 0],
    [0, 1, 1],
    [1, 1, 0],
    [2, 2, 2],
    [1, 2, 2],
    [2, 1, 2],
  ];
  var train_labels = [0, 0, 0, 1, 1, 1];
  var knn = new KNN(train_dataset, train_labels, { k: 2 }); // consider 2 nearest neighbors
  var test_dataset = [
    [0.9, 0.9, 0.9],
    [1.1, 1.1, 1.1],
    [1.1, 1.1, 1.2],
    [1.2, 1.2, 1.2],
  ];
  var ans = knn.predict(test_dataset);

  const documents: string[] = [
    "Nếu bạn có sẵn telegram thì được đăng ký free nhé！",
    "Em Bán Sim Vina Giống 6- 9 Số AC: 0815.496.000 - Giá Bán: 800,000 ☎️ ☎️  Liên Hệ Mua Sim : 0911929999",
    "em là nữ lớp 12 em xin chút review mi1 của trường và cơ hội xttn ạ",
    "Mua hộ bố cái thẻ vina 10k đi nạp sđt 0863643624",
    "Tiktok đang tuyển nhân viên làm việc tại nhà !"
];

const documentToAnalyze: string = documents[0]; // 



  function computeTF(word: string, document: string): number {
    let wordCount = 0;
    const words: string[] = document.toLowerCase().split(' ');
    words.forEach((w) => {
        if (w === word) {
            wordCount++;
        }
    });
    return wordCount / words.length;
}

function computeIDF(word: string, allDocuments: string[]): number {
  let numDocsContainingWord = 0;
  allDocuments.forEach((document) => {
    document = document.toLowerCase()
      if (document.includes(word.toLowerCase())) {
          numDocsContainingWord++;
      }
  });
  return Math.log(allDocuments.length / (numDocsContainingWord));
}

function computeTFIDF(word: string, document: string, allDocuments: string[]): number {
  const tf = computeTF(word, document);
  const idf = computeIDF(word, allDocuments);
  return tf * idf;
}

// Tính TF-IDF cho tất cả từ trong tài liệu
function computeAllTFIDF(document: string, allDocuments: string[]): Record<string, number> {
  const words: string[] = [...new Set(document.split(' '))]; // Xóa từ trùng lặp
  const tfidfScores: Record<string, number> = {};

  words.forEach((word) => {
      tfidfScores[word] = computeTFIDF(word, document, allDocuments);
  });

  return tfidfScores;
}
const allTfidfScores: Record<string, Record<string, number>> = {};
  useEffect(()=>{
    // console.log(KNN);
    // console.log(knn);
    // console.log(ans);
    const lowercasedDocuments = documents.map(doc => doc.toLowerCase());

    const arrayOfTfIdf:any[]=[]
    
    for(let i=0;i<documents.length-1;i++){
      let tfidfScore = computeAllTFIDF(lowercasedDocuments[i],documents)
      allTfidfScores[`Document ${i + 1}`] = tfidfScore;
      const arrayTemp = Object.values(allTfidfScores[`Document ${i + 1}`])
      arrayOfTfIdf.push(arrayTemp)
    }
    const allTfIdfJSON = JSON.stringify(allTfidfScores, null, 2);
    // console.log(allTfIdfJSON);
    console.log(arrayOfTfIdf);
    var train_labels_test = [0,1,1,0]
    var KNN_test = new KNN(arrayOfTfIdf, train_labels_test, { k: 2 }); 
    let tfidf_temp = computeAllTFIDF(lowercasedDocuments[4],documents)
    allTfidfScores[`Document 5`] = tfidf_temp
    let test_TfIdf_array = Object.values(allTfidfScores[`Document 5`])
    let res = KNN_test.predict(test_TfIdf_array)
    console.log(res);
  })

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({ ios: 'cmd + d', android: 'cmd + m' })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          Tap the Explore tab to learn more about what's included in this starter app.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          When you're ready, run{' '}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
