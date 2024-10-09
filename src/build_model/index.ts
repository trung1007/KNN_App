import { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';



const KNN = require('ml-knn');
const [KNN_JSON_MODEL_Data, set_KNN_JSON_MOEL_Data] = useState<typeof KNN>([])
const [trainDataSetArray, setTrainDataSetArray] = useState([])
const [trainDataLabelArray, setTrainDataLabelArray] = useState([])
const [trainNewModel, setTrainNewModel] = useState(false)
const dataDictionary = require('../../assets/dictionary.json')
const dictionaryTest = require('../../assets/dictionary_test.json')
const dictionaryW2V = require('../../assets/dataset_new_vector_wav2vec.json')



function flattenArray(arr: any) {
  return arr.flat(Infinity); // Flatten to 1D array
}
function convertWordTovec(trainDataSet: any) {
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
    let wordsPerSentence: string[] = trainDataSetString[i].toLowerCase().trim().split(" ")
    let arrayPerSentence: any[] = []
    for (let j = 0; j < wordsPerSentence.length; j++) {
      if (wordsPerSentence[j] in dataDictionary) {
        arrayPerSentence.push(dataDictionary[wordsPerSentence[j]])
      }
      else {
        arrayPerSentence.push(dataDictionary['unknown'])
      }
      flattenArray(arrayPerSentence)
    }
    trainDataSetArray.push(arrayPerSentence)
  }
  saveTrainDataSetArray(trainDataSetArray)
  saveTrainLabelArray(trainLabelArray)
}

function convertTestToArray(sentences: string[]) {
  let sentencesString: any = []
  for (let i = 0; i < sentences.length; i++) {
    if (i % 2 === 0) {
      sentencesString.push(sentences[i])
    }
  }
  const sentencesArray: any[] = []
  for (let i = 0; i < sentencesString.length; i++) {
    let wordsPerSentence: string[] = sentencesString[i].toLowerCase().trim().split(" ")
    let arrayPerSentence: any[] = []
    for (let j = 0; j < wordsPerSentence.length; j++) {
      if (wordsPerSentence[j] in dataDictionary) {
        arrayPerSentence.push(dataDictionary[wordsPerSentence[j]])
      }
      else {
        arrayPerSentence.push(dataDictionary['unknown'])
      }
      flattenArray(arrayPerSentence)
    }
    sentencesArray.push(arrayPerSentence)
  }
  return sentencesArray
}

const saveTrainDataSetArray = async (trainDataSetArray: any) => {
  const path = FileSystem.documentDirectory + 'trainDataSetArray.json';
  const trainDataSetArrayJSON = JSON.stringify(trainDataSetArray, null, 2);

  try {
    // Ghi chuỗi JSON vào tệp
    await FileSystem.writeAsStringAsync(path, trainDataSetArrayJSON);
    // console.log("Lưu tệp thành công tại:", path);
  } catch (error) {
    console.log("Lỗi khi ghi tệp:", error);
  }
}

const saveTrainLabelArray = async (trainLabelArray: any) => {
  const path = FileSystem.documentDirectory + 'trainLabelArray.json';
  const trainLabelJSON = JSON.stringify(trainLabelArray, null, 2)
  try {
    // Ghi chuỗi JSON vào tệp
    await FileSystem.writeAsStringAsync(path, trainLabelJSON);
    // console.log("Lưu tệp thành công tại:", path);
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

    // console.log("Dữ liệu trong tệp:", trainDataSetArray); // In dữ liệu để kiểm tra
    setTrainDataSetArray(trainDataSetArray)
  } catch (error) {
    console.log("Lỗi khi đọc tệp:", error);
    return null; // Trả về null nếu có lỗi
  }
};

const readTrainLabelArray = async () => {
  const path = FileSystem.documentDirectory + 'trainLabelArray.json'; // Đường dẫn tới tệp đã lưu
  try {
    // Đọc nội dung của tệp JSON
    const content = await FileSystem.readAsStringAsync(path);
    // Chuyển chuỗi JSON thành mảng hoặc đối tượng
    const trainLabelArray = JSON.parse(content);

    // console.log('Đọc tệp thành công:', trainLabelArray);

    setTrainDataLabelArray(trainLabelArray)
  } catch (error) {
    console.log("Lỗi khi đọc tệp:", error);
    return null;
  }
};

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

const readKNN_JSON = async () => {
  const path = FileSystem.documentDirectory + 'knn.json';
  try {
    // Đọc nội dung của tệp JSON
    const KNN_JSON = await FileSystem.readAsStringAsync(path);
    const parse_KNN_MODEL = JSON.parse(KNN_JSON); // Chuyển chuỗi JSON thành đối tượng
    const KNN_model = KNN.load(parse_KNN_MODEL)
    set_KNN_JSON_MOEL_Data(KNN_model)

    console.log('Đọc tệp thành công và mô hình KNN đã được khôi phục');
  } catch (error) {
    console.log('Lỗi khi đọc tệp:', error);
  }
};


function trainKNN_Model(trainDataSet?: any) {
  readTrainDataSetArray()
  readTrainLabelArray()
  const KNN_model = new KNN(trainDataSetArray, trainDataLabelArray, { k: 2 })
  saveKNN_JSON(KNN_model)
  readKNN_JSON()
}