import { Image, StyleSheet, Platform } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useEffect, useState } from 'react';
import dataset from '../../src/dataset.js'
// import trainData from '../../src/traindata.js'
import testData from '../../src/testdata.js'
import trainData from '../../src/traindata.js'
import RNFS from 'react-native-fs'
import * as FileSystem from 'expo-file-system';

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
    const words: string[] = [...new Set(document.toLowerCase().split(' '))]; // Xóa từ trùng lặp
    const tfidfScores: Record<string, number> = {};

    words.forEach((word) => {
      tfidfScores[word] = computeTFIDF(word, document, allDocuments);
    });

    return tfidfScores;
  }
  const allTfidfScores: Record<string, Record<string, number>> = {};
  const allTfIdfScores: Record<string, Record<string, number>> = {};
  const [KNN_JSON_MODEL_Data, set_KNN_JSON_MOEL_Data] = useState();
  const [jsonData, setJsonData] = useState('')

  const saveKNN_JSON = async (knn_model: any) => {
    const KNN_JSON = JSON.stringify(knn_model, null, 2)
    const path = FileSystem.documentDirectory + 'knn.json';

    try {
      await FileSystem.writeAsStringAsync(path, KNN_JSON);
      console.log("Lưu tệp thành công");
    } catch (error) {
      console.log('Lỗi khi ghi tệp:', error);
    }
  };

  const readKNN_JSON = async (testData: any) => {
    const path = FileSystem.documentDirectory + 'knn.json';
    try {
      // Đọc nội dung của tệp JSON
      const KNN_JSON = await FileSystem.readAsStringAsync(path);
      const parse_KNN_MODEL = JSON.parse(KNN_JSON); // Chuyển chuỗi JSON thành đối tượng



      // console.log(knn); // In thông tin của mô hình để kiểm tra
      // console.log(knn.predict(test_dataset)); // Dự đoán với dữ liệu mới
      const KNN_model = KNN.load(parse_KNN_MODEL)
      set_KNN_JSON_MOEL_Data(KNN_model)
      console.log(KNN_model);
      console.log(KNN_model.predict(testData));
      console.log('Đọc tệp thành công và mô hình KNN đã được khôi phục');
    } catch (error) {
      console.log('Lỗi khi đọc tệp:', error);
    }
  };

  const saveTrainDataSetArray = async (trainDataSetArray: any) => {
    const path = FileSystem.documentDirectory + 'trainDataSetArray.json';
    const trainDataSetArrayJSON = JSON.stringify(trainDataSetArray, null, 2);

    try {
      // Ghi chuỗi JSON vào tệp
      await FileSystem.writeAsStringAsync(path, trainDataSetArrayJSON);
      console.log("Lưu tệp thành công tại:", path);
    } catch (error) {
      console.log("Lỗi khi ghi tệp:", error);
    }
  }

  const readTrainDataSetArray = async () => {
    const path = FileSystem.documentDirectory + 'trainDataSetArray.json'; // Đường dẫn tới file đã lưu
  
    try {
      // Đọc nội dung từ tệp
      const fileContent = await FileSystem.readAsStringAsync(path);
      
      // Chuyển đổi chuỗi JSON thành mảng
      const trainDataSetArray = JSON.parse(fileContent);
      
      console.log("Dữ liệu trong tệp:", trainDataSetArray); // In dữ liệu để kiểm tra
      return trainDataSetArray; // Trả về dữ liệu đã đọc
    } catch (error) {
      console.log("Lỗi khi đọc tệp:", error);
      return null; // Trả về null nếu có lỗi
    }
  };

  const saveTrainLabelArray = async(trainLabelArray:any)=>{
    const path = FileSystem.documentDirectory + 'trainLabelArray.json';
    const trainLabelJSON = JSON.stringify(trainLabelArray, null, 2)
    try {
      // Ghi chuỗi JSON vào tệp
      await FileSystem.writeAsStringAsync(path, trainLabelArray);
      console.log("Lưu tệp thành công tại:", path);
    } catch (error) {
      console.log("Lỗi khi ghi tệp:", error);
    }
  }


  useEffect(() => {

    // const knn_model = JSON.parse(jsonData)
    // console.log(knn.predict(test_dataset));
    // console.log(knn.toJSON());

    // console.log(knn_model.predict(test_dataset));

    const trainDataSetString = []
    const trainLabelArray = []
    for (let i = 0; i < trainData.length; i++) {
      if (i % 2 === 0) {
        trainDataSetString.push(trainData[i])
      }
      else {
        trainLabelArray.push(parseInt(trainData[i], 10))
      }
    }
    // const trainDataSetArray = []
    // for (let i = 0; i < trainDataSetString.length; i++) {
    //   var trainProccess = (i + 1) * 100 / trainDataSetString.length
    //   console.log(trainProccess.toFixed(2) + "%");
    //   let TfIdfScoreTemp = computeAllTFIDF(trainDataSetString[i], trainDataSetString)
    //   allTfIdfScores[`Document ${i + 1}`] = TfIdfScoreTemp
    //   const TfIdfArrayTemp = Object.values(allTfIdfScores[`Document ${i + 1}`])
    //   trainDataSetArray.push(TfIdfArrayTemp)
    // }
    // saveTrainDataSetArray(trainDataSetArray)
    // saveTrainLabelArray(trainLabelArray)
    readTrainDataSetArray()




    // const testDataSetString = []
    // for (let i = 0; i < testData.length; i++) {
    //   if (i % 2 === 0) {
    //     testDataSetString.push(testData[i])
    //   }
    // }

    // const testDataSetArray = []
    // for (let i = 0; i < testDataSetString.length; i++) {
    //   var convertProccess = (i + 1) * 100 / testDataSetString.length
    //   console.log(convertProccess.toFixed(2) + "%");
    //   let TfIdfScoreTemp = computeAllTFIDF(testDataSetString[i], testDataSetString)
    //   allTfIdfScores[`Document ${i + 1}`] = TfIdfScoreTemp
    //   const TfIdfArrayTemp = Object.values(allTfIdfScores[`Document ${i + 1}`])
    //   testDataSetArray.push(TfIdfArrayTemp)
    // }

    // readKNN_JSON(testDataSetArray)

  }, [])

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
