import { useState } from 'react';
import { View, SafeAreaView, Text, TextInput, StyleSheet, Button, TouchableOpacity, Image, ScrollView } from 'react-native'
import * as FileSystem from 'expo-file-system';
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";

const MessageScreen = () => {

    const navigation = useNavigation()

    const KNN = require('ml-knn');

    const [KNN_JSON_MODEL_Data, set_KNN_JSON_MOEL_Data] = useState<typeof KNN>([])
    const dataDictionary = require('../../../assets/dictionary.json')


    const [text, onChangeText] = useState('');
    const [number, onChangeNumber] = useState('');
    const [dectect, setDetect] = useState('')
    const [message, setMessage] = useState('')
    const messages: string[] = []


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

    const goDetail = () => {
        //@ts-ignore
        navigation.navigate('inf')
    }


    const handleDetect = async (text: string) => {

        await readKNN_JSON()
        let tmp: any = []
        let sentencesToArray = convertTestToArray(text);

        console.log(KNN_JSON_MODEL_Data);
        try {
            tmp = KNN_JSON_MODEL_Data.predict(sentencesToArray);
        } catch (error) {
            console.log(error);
        }
        setDetect(tmp)
    }
    const sendMessage = (text: string) => {
        messages.push(text)
        console.log(messages);
        
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => {
                    navigation.goBack();
                }}
            >
                <AntDesign
                    name="arrowleft"
                    size={24}
                />
            </TouchableOpacity>
            <View style={styles.userInf}>
                <Image source={require('../../../assets/images/avatar.jpg')} style={styles.avatar} />
                <TouchableOpacity style={styles.infDetail} onPress={goDetail}>
                    <Text>Cao Thanh Trung</Text>
                    <AntDesign name="right" size={16} color="black" />
                </TouchableOpacity>
            </View>
            <ScrollView>
                {messages.map((message, index) => (
                    <Text key={index}>
                        {message}
                    </Text>
                ))}
            </ScrollView>
            <View style={styles.input}>
                <TextInput
                    style={styles.inputPlace}
                    onChangeText={onChangeText}
                    value={text}
                />
                <TouchableOpacity onPress={() => { sendMessage(text) }}>
                    <AntDesign name="rightcircle" size={24} color="blue" />
                </TouchableOpacity>
            </View>



        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    userInf: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatar: {
        height: 80,
        width: 80,
        borderRadius: 40
    },
    infDetail: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    input: {
        marginLeft: 8,
        marginRight: 8,
        display: 'flex',
        flexDirection: 'row',
        padding: 10,
        position: 'absolute',
        bottom: 0,
        width: '80%',
        alignItems: 'center'

    },
    inputPlace: {
        borderWidth: 1,
        borderRadius: 20,
        width: '100%',
        padding: 8,
        height: 32,
        marginRight: 16
    }
});

export default MessageScreen