import { Image, StyleSheet, Platform } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useEffect, useState } from 'react';
import dataset from '../../src/dataset.js'
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
  const allArrayOfSentences: Record<string, Record<string, number>> = {};
  const [KNN_JSON_MODEL_Data, set_KNN_JSON_MOEL_Data] = useState<typeof KNN>([])
  const [trainDataSetArray, setTrainDataSetArray] = useState([])
  const [trainDataLabelArray, setTrainDataLabelArray] = useState([])
  const [trainNewModel, setTrainNewModel] = useState(false)




  //Convert TrainDataSet to array and save its array and label into JSON file in react-native
  const convertTrainDataSet = (trainDataSet: any) => {
    const trainDataSetString = []
    const trainLabelArray = []
    for (let i = 0; i < trainDataSet.length; i++) {
      if (i % 2 === 0) {
        trainDataSetString.push(trainDataSet[i])
      }
      else {
        trainLabelArray.push(parseInt(trainDataSet[i], 10))
      }
    }
    const trainDataSetArray = []
    for (let i = 0; i < trainDataSetString.length; i++) {
      var trainProccess = (i + 1) * 100 / trainDataSetString.length
      console.log(trainProccess.toFixed(2) + "%");
      let TfIdfScoreTemp = computeAllTFIDF(trainDataSetString[i], trainDataSetString)
      allTfIdfScores[`Document ${i + 1}`] = TfIdfScoreTemp
      const TfIdfArrayTemp = Object.values(allTfIdfScores[`Document ${i + 1}`])
      trainDataSetArray.push(TfIdfArrayTemp)
    }
    saveTrainDataSetArray(trainDataSetArray)
    saveTrainLabelArray(trainLabelArray)
  }

  // Save KNN_Model
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

  // Read KNN_Model
  const readKNN_JSON = async () => {
    const path = FileSystem.documentDirectory + 'knn.json';
    try {
      // Đọc nội dung của tệp JSON
      const KNN_JSON = await FileSystem.readAsStringAsync(path);
      const parse_KNN_MODEL = JSON.parse(KNN_JSON); // Chuyển chuỗi JSON thành đối tượng
      const KNN_model = KNN.load(parse_KNN_MODEL)
      set_KNN_JSON_MOEL_Data(KNN_model)
      // console.log(KNN_model);
      // console.log('Đọc tệp thành công và mô hình KNN đã được khôi phục');
    } catch (error) {
      console.log('Lỗi khi đọc tệp:', error);
    }
  };

  // Save TrainDataSet
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

  // Read TrainDataSet
  const readTrainDataSetArray = async () => {
    const path = FileSystem.documentDirectory + 'trainDataSetArray.json'; // Đường dẫn tới file đã lưu

    try {
      // Đọc nội dung từ tệp
      const fileContent = await FileSystem.readAsStringAsync(path);

      // Chuyển đổi chuỗi JSON thành mảng
      const trainDataSetArray = JSON.parse(fileContent);

      console.log("Dữ liệu trong tệp:", trainDataSetArray); // In dữ liệu để kiểm tra

      setTrainDataSetArray(trainDataSetArray)

    } catch (error) {
      console.log("Lỗi khi đọc tệp:", error);
      return null; // Trả về null nếu có lỗi
    }
  };

  // Save Train_label
  const saveTrainLabelArray = async (trainLabelArray: any) => {
    const path = FileSystem.documentDirectory + 'trainLabelArray.json';
    const trainLabelJSON = JSON.stringify(trainLabelArray, null, 2)
    try {
      // Ghi chuỗi JSON vào tệp
      await FileSystem.writeAsStringAsync(path, trainLabelJSON);
      console.log("Lưu tệp thành công tại:", path);
    } catch (error) {
      console.log("Lỗi khi ghi tệp:", error);
    }
  }

  // Read Train_Label
  const readTrainLabelArray = async () => {
    const path = FileSystem.documentDirectory + 'trainLabelArray.json'; // Đường dẫn tới tệp đã lưu
    try {
      // Đọc nội dung của tệp JSON
      const content = await FileSystem.readAsStringAsync(path);
      // Chuyển chuỗi JSON thành mảng hoặc đối tượng
      const trainLabelArray = JSON.parse(content);

      console.log('Đọc tệp thành công:', trainLabelArray);

      setTrainDataLabelArray(trainLabelArray)
    } catch (error) {
      console.log("Lỗi khi đọc tệp:", error);
      return null;
    }
  };

  function convertSentenceToArray(sentences: string[]) {
    let convertToArray: any = []
    for (let i = 0; i < sentences.length; i++) {
      let sentenceTfIdf = computeAllTFIDF(sentences[i], sentences)
      allArrayOfSentences[`Document ${i + 1}`] = sentenceTfIdf
      let sentenceArray = Object.values(allArrayOfSentences[`Document ${i + 1}`])
      convertToArray.push(sentenceArray)
    }
    return convertToArray
  }

  function trainKNN_Model(trainDataSet: any) {
    convertTrainDataSet(trainDataSet)
    readTrainDataSetArray()
    readTrainLabelArray()
    const KNN_model = new KNN(trainDataSetArray, trainDataLabelArray, { k: 2 })
    saveKNN_JSON(KNN_model)
    readKNN_JSON()
  }





  useEffect(() => {
    // saveTrainDataSetArray(trainDataSetArray)
    // saveTrainLabelArray(trainLabelArray)
    // readTrainDataSetArray()
    // readTrainLabelArray()


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




    let sentencesTotest: string[] = ["Xin chao ban", "Toi ten la", "Em Co' S0-NamSinh 0812.18.08.70 asdasdsa ", "Em Co' S0-NamSinh 0812.18.08.70  = 550K *CAII.09 8222 5777 Cam.On QK!--tnPYX-"]
    let sentencesArray = convertSentenceToArray(sentencesTotest)

    // Condition to train new model or not 
    if (trainNewModel) {
      trainKNN_Model(trainData)
    }
    else {
      readKNN_JSON()
      if (KNN_JSON_MODEL_Data !== undefined) {
        try {
          console.log(KNN_JSON_MODEL_Data);

          console.log(KNN_JSON_MODEL_Data.predict(sentencesArray));

        } catch (error) {
          console.log(error);
        }
      }
    }


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
