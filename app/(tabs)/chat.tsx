import { useState } from 'react';
import { View, SafeAreaView, Text, TextInput, StyleSheet, Button } from 'react-native'
import * as FileSystem from 'expo-file-system';


const ChatScreen = () => {

    const KNN = require('ml-knn');

    const [KNN_JSON_MODEL_Data, set_KNN_JSON_MOEL_Data] = useState<typeof KNN>([])
    const dataDictionary = require('../../assets/dictionary.json')


    const [text, onChangeText] = useState('');
    const [number, onChangeNumber] = useState('');
    const [dectect, setDetect] = useState('')

    const readKNN_JSON = async () => {
        const path = FileSystem.documentDirectory + 'knn.json';
        try {
            // Đọc nội dung của tệp JSON
            const KNN_JSON = await FileSystem.readAsStringAsync(path);
            const parse_KNN_MODEL = JSON.parse(KNN_JSON); // Chuyển chuỗi JSON thành đối tượng
            const KNN_model = KNN.load(parse_KNN_MODEL)
            set_KNN_JSON_MOEL_Data(KNN_model)
            // console.log(KNN_JSON_MODEL_Data);

            // console.log('Đọc tệp thành công và mô hình KNN đã được khôi phục');
        } catch (error) {
            console.log('Lỗi khi đọc tệp:', error);
        }
    };
    function flattenArray(arr: any) {
        return arr.flat(Infinity); // Flatten to 1D array
    }
    function convertTestToArray(sentences: string) {
        let sentencesString: any = []
        sentencesString.push(sentences)
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

    const handleDetect = (text: string) => {

        readKNN_JSON()
        setDetect(text)
        let tmp: any = []
    let sentencesToArray = convertTestToArray(text);

        console.log(KNN_JSON_MODEL_Data);
        try {
            tmp = KNN_JSON_MODEL_Data.predict(sentencesToArray);
        } catch (error) {
            console.log(error);
        }
        console.log(tmp);
        

    }

    return (
        <SafeAreaView style={{ display: 'flex', flex: 1 }}>
            <View style={{ height: 300, backgroundColor: 'red' }}>

            </View>
            <Text>
                aaaaaaa
            </Text>
            <TextInput
                style={styles.input}
                onChangeText={onChangeText}
                value={text}
            />
            <Button title='detect' onPress={() => { handleDetect(text) }} />

            <View>
                <Text>
                    {dectect}
                </Text>
            </View>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
});

export default ChatScreen